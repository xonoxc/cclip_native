import React, { useCallback } from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Badge, Clock, Download, Trash } from "lucide-react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
// import { filesize } from "filesize"
import { Video } from "@prisma/client/react-native"
import { Progress } from "tamagui"
import { cloud } from "@/lib/cloudinary"

dayjs.extend(relativeTime)

const VideoCard = ({
    video,
    onDownload,
    onDelete,
    className,
}: {
    video: Video
    onDownload: (url: string, publicId: string) => void
    onDelete: (videoId: string, publicId: string) => void
    className: string
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

    // const formatSize = useCallback((size: string) => {
    //     return size !== "undefined" ? filesize(parseInt(size)) : "N/A"
    // }, [])

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.round(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }, [])

    const calcCompressionPercentage = useCallback(
        (compressedSize: number, originalSize: number) => {
            const percentage = ((compressedSize / originalSize) * 100).toFixed(
                2
            )
            return parseFloat(percentage)
        },
        []
    )

    return (
        <View
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg bg-[#161617] border border-white/10 rounded-xl ${className}`}
        >
            <View className="relative aspect-video group">
                <Image
                    source={{ uri: getThumbnailUrl(video.publicId) }}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-t-xl"
                />
                <View className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(Number(video.duration))}
                </Badge>
            </View>
            <View className="pb-2">
                <Text className="text-lg font-semibold line-clamp-1 text-white">
                    {video.title}
                </Text>
            </View>
            <View className="space-y-4">
                <Text className="text-sm text-white/70 line-clamp-2">
                    {video.description}
                </Text>
                <Text className="text-xs text-white/50">
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </Text>
                {video.compressedSize.toString() !== "undefined" ? (
                    <>
                        <View className="grid grid-cols-2 gap-4 text-sm text-white"></View>
                        <View className="space-y-2 text-white">
                            <View className="flex justify-between text-sm">
                                <Text>Compression</Text>
                                <Text className="font-medium">
                                    {calcCompressionPercentage(
                                        parseInt(video.compressedSize),
                                        parseInt(video.originalSize)
                                    )}
                                    %
                                </Text>
                            </View>
                            <Progress
                                value={calcCompressionPercentage(
                                    parseInt(video.compressedSize),
                                    parseInt(video.originalSize)
                                )}
                                className="h-2 bg-white/10"
                            />
                        </View>
                    </>
                ) : (
                    <Badge className="bg-white/10 text-white">
                        Cannot compress
                    </Badge>
                )}
            </View>
            <View className="flex items-center justify-between gap-2 pt-4">
                <TouchableOpacity
                    className="flex-1 bg-white text-black hover:bg-white/90 transition-colors"
                    onPress={() =>
                        onDownload(
                            getFullVideoUrl(video.publicId),
                            video.publicId
                        )
                    }
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onDelete(video.id, video.publicId)}
                    className="bg-white/10 text-white hover:bg-white/20 transition-colors p-2"
                >
                    <Trash className="w-4 h-4" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default VideoCard
