import { v2 as cloudinary } from "cloudinary"
import { cloudinaryConfg } from "~/lib/cloudinary"
import { dbClient } from "~/lib/prisma/prisma.client"

cloudinary.config({ ...cloudinaryConfg })

export async function GET(_: Request) {
   try {
      const videos = await dbClient.video.findMany({
         orderBy: {
            createdAt: "desc",
         },
      })
      return Response.json(videos)
   } catch (error) {
      return Response.json({ error: "Error fetching videos" }, { status: 500 })
   } finally {
      await dbClient.$disconnect()
   }
}

export async function DELETE(request: Request) {
   try {
      const { videoId, public_id }: { videoId: string; public_id: string } =
         await request.json()

      if (!videoId || !public_id) {
         return Response.json(
            {
               error: `${!videoId ? "videoId" : "video_public_id"} not provided`,
            },
            { status: 400 }
         )
      }

      console.log("crednentials found...")

      const cloudinaryResponse = await cloudinary.uploader.destroy(public_id, {
         resource_type: "video",
         invalidate: true,
      })

      if (cloudinaryResponse.result !== "ok") {
         return Response.json(
            {
               error: `Cloudinary deletion failed: ${cloudinaryResponse.result}`,
            },
            { status: 400 }
         )
      }

      const delDbResponse = await dbClient.video.delete({
         where: {
            id: videoId,
         },
      })

      if (!delDbResponse) {
         return Response.json(
            {
               error: "error deleting video from database",
            },
            { status: 500 }
         )
      }

      return Response.json(
         { message: "sucesss, video deleted successfully!" },
         { status: 200 }
      )
   } catch (error) {
      console.error("error while deleting video on server:", error)
      return Response.json(
         {
            error: "Error deleting video",
         },
         { status: 500 }
      )
   } finally {
      await dbClient.$disconnect()
   }
}
