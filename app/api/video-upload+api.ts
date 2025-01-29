import { dbClient } from "@/lib/prisma.client"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const {
            title,
            description,
            publicId,
            originalSize,
            compressedSize,
            duration,
        } = body

        if (
            !title ||
            !description ||
            !publicId ||
            !originalSize ||
            !compressedSize ||
            !duration
        ) {
            console.error("error block exectued")
            return Response.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        const video = await dbClient.video.create({
            data: {
                title,
                description,
                publicId,
                originalSize: String(originalSize),
                compressedSize: String(compressedSize),
                duration: String(duration) || "0",
            },
        })

        if (!video) {
            return Response.json(
                {
                    error: "Error creating vieo entry",
                },
                { status: 500 }
            )
        }

        return Response.json(video)
    } catch (error) {
        console.log("UPload video failed", error)

        return Response.json({ error: "Video upload failed" }, { status: 500 })
    } finally {
        await dbClient.$disconnect()
    }
}
