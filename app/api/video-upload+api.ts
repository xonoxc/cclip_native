import { v2 as cloudinary } from "cloudinary"
import { cloudinaryConfg } from "@/lib/cloudinary"
import { CloudinaryUploadResult } from "@/app/api/image-upload+api"
import { dbClient } from "@/lib/prisma.client"

cloudinary.config(cloudinaryConfg)

interface VideoUploadResult extends CloudinaryUploadResult {
    bytes: number
    duration?: number
}

export async function POST(request: Request) {
    try {
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
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
        const file = formData.get("file") as File | null

        if (!file)
            return Response.json({ error: "File not found" }, { status: 400 })

        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const originalSize = formData.get("originalSize") as string

        const bytes = await file?.arrayBuffer()
        const buffer = Buffer.from(bytes as ArrayBuffer)

        const result = await new Promise<VideoUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "cclip",
                        transformation: [
                            { quality: "auto:eco", fetch_format: "mp4" },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result as Awaited<VideoUploadResult>)
                    }
                )
                uploadStream.end(buffer)
            }
        )

        const video = await dbClient.video.create({
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
        console.log("UPload video failed", error)

        return Response.json({ error: "Video upload failed" }, { status: 500 })
    } finally {
        await dbClient.$disconnect()
    }
}
