import { v2 as cloudinary } from "cloudinary"
import { PrismaClient } from "@prisma/client"
import { cloudinaryConfg } from "~/lib/cloudinary"
import { CloudinaryUploadResult } from "./image-upload+api"

const prisma = new PrismaClient()

cloudinary.config(cloudinaryConfg)

interface VideoUploadResult extends CloudinaryUploadResult {
   bytes: number
   duration?: number
}

export async function POST(request: Request) {
   try {
      if (
         !process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
         !process.env.CLOUDINARY_API_KEY ||
         !process.env.CLOUDINARY_API_SECRET
      ) {
         return Response.json(
            {
               error: "Cloudinary credentials missing!",
            },
            { status: 500 }
         )
      }

      const formData = await request.formData()
      console.log("formData", formData)
      const file = formData.get("file") as File | null

      if (!file)
         return Response.json({ error: "File not found" }, { status: 400 })

      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const originalSize = formData.get("originalSize") as string

      const bytes = await file?.arrayBuffer()
      const buffer = Buffer.from(bytes as ArrayBuffer)

      const result = await new Promise<VideoUploadResult>((resolve, reject) => {
         const uploadStream = cloudinary.uploader.upload_stream(
            {
               resource_type: "video",
               folder: "cclip",
               transformation: [{ quality: "auto:eco", fetch_format: "mp4" }],
               eager_async: true,
            },
            (error, result) => {
               if (error) reject(error)
               else resolve(result as Awaited<VideoUploadResult>)
            }
         )
         uploadStream.end(buffer)
      })

      const video = await prisma.video.create({
         data: {
            title,
            description,
            publicId: result.public_id,
            originalSize: originalSize,
            compressedSize: String(result.bytes),
            duration: String(result.duration || 0),
         },
      })

      return Response.json(video)
   } catch (error) {
      console.log("error uploading video to the server:", error)
      return Response.json({ error: "Video upload failed" }, { status: 500 })
   } finally {
      await prisma.$disconnect()
   }
}
