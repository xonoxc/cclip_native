import React, { useCallback } from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Clock, Download, Trash } from "lucide-react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Video } from "@prisma/client"
import { cloud } from "@/lib/cloudinary"

dayjs.extend(relativeTime)

const VideoCard = ({
    video,
    onDownload,
    onDelete,
}: {
    video: Video
    onDownload: (url: string, publicId: string) => void
    onDelete: (videoId: string, publicId: string) => void
}) => {
    const getThumbnailUrl = useCallback((publicId: string) => {
        return cloud
            .video(publicId)
            .setAssetType("image")
            .addTransformation("so_8.5")
            .toURL()
    }, [])

    const getFullVideoUrl = useCallback((publicId: string) => {
        return cloud.video(publicId).toURL()
    }, [])

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.round(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }, [])

    const calcCompressionPercentage = useCallback(
        (compressedSize: number, originalSize: number) => {
            if (originalSize === 0) return 0
            const percentage = (compressedSize / originalSize) * 100
            return Math.round(percentage * 100) / 100
        },
        []
    )

    return (
        <View className="bg-[#161617] border border-white/10 rounded-xl overflow-hidden m-2 flex-1">
            <View className="relative aspect-video">
                <Image
                    source={{ uri: getThumbnailUrl(video.publicId) }}
                    className="w-full h-full object-cover"
                />
                <View className="absolute inset-0 bg-black bg-opacity-40" />
                <View className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded flex-row items-center">
                    <Clock className="w-3 h-3 mr-1 text-white" />
                    <Text className="text-white text-xs">
                        {formatDuration(Number(video.duration))}
                    </Text>
                </View>
            </View>
            <View className="p-4">
                <Text className="text-lg font-semibold text-white mb-2">
                    {video.title}
                </Text>
                <Text className="text-sm text-white/70 mb-2">
                    {video.description}
                </Text>
                <Text className="text-xs text-white/50 mb-2">
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </Text>
                {video.compressedSize.toString() !== "undefined" ? (
                    <View className="mb-2">
                        <View className="flex-row justify-between text-sm text-white mb-1">
                            <Text>Compression</Text>
                            <Text className="font-medium">
                                {calcCompressionPercentage(
                                    parseInt(video.compressedSize),
                                    parseInt(video.originalSize)
                                )}
                                %
                            </Text>
                        </View>
                        {/* Replace this with an actual Progress component */}
                        <View className="h-2 bg-white/10 rounded">
                            <View
                                className="h-full bg-white rounded"
                                style={{
                                    width: `${calcCompressionPercentage(
                                        parseInt(video.compressedSize),
                                        parseInt(video.originalSize)
                                    )}%`,
                                }}
                            />
                        </View>
                    </View>
                ) : (
                    <View className="bg-white/10 text-white px-2 py-1 rounded">
                        <Text>Cannot compress</Text>
                    </View>
                )}
                <View className="flex-row items-center justify-between mt-4">
                    <TouchableOpacity
                        className="flex-1 bg-white text-black py-2 rounded flex-row items-center justify-center mr-2"
                        onPress={() =>
                            onDownload(
                                getFullVideoUrl(video.publicId),
                                video.publicId
                            )
                        }
                    >
                        <Download className="w-4 h-4 mr-2 text-black" />
                        <Text className="text-black">Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(video.id, video.publicId)}
                        className="bg-white/10 text-white p-2 rounded"
                    >
                        <Trash className="w-4 h-4 text-white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default VideoCard
