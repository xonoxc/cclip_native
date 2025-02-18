import React, { useCallback, useState } from "react"
import { View, Text, Image, ActivityIndicator } from "react-native"
import { Clock, Download, Trash } from "lucide-react-native"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Video } from "@prisma/client"
import { cloud } from "~/lib/cloudinary"
import { Button } from "./button"
import { Progress } from "./progress"

dayjs.extend(relativeTime)

const VideoCard = ({
   video,
   onDownload,
   onDelete,
}: {
   video: Video
   onDownload: (url: string, publicId: string) => Promise<void>
   onDelete: (videoId: string, publicId: string) => void
}) => {
   const [isDeleting, setIsDeleting] = useState<boolean>(false)

   const getThumbnailUrl = useCallback((publicId: string) => {
      const baseURL = process.env.EXPO_PUBLIC_CLOUDINARY_THUMBNAIL_URL!
      if (!baseURL) {
         throw new Error(
            "Please set EXPO_PUBLIC_CLOUDINARY_FETCH_IMAGE_BASE_URL in .env"
         )
      }
      return `${baseURL}/${publicId}.jpg`
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

   const handlerCardDeleteButtonClick = useCallback(async () => {
      setIsDeleting(true)
      await onDelete(video.id, video.publicId)
      setIsDeleting(false)
   }, [])

   return (
      <View className="bg-[#161617] border border-white/10 rounded-3xl overflow-hidden m-2 flex-1">
         <View className="relative aspect-video">
            <Image
               source={{ uri: getThumbnailUrl(video.publicId) }}
               className="w-full h-full object-cover"
            />
            <View className="absolute bottom-2 right-2 bg-black px-2 py-1 rounded-lg flex-row items-center gap-2">
               <Clock
                  color="white"
                  size={14}
                  className="w-3 h-3 mr-1 text-white"
               />
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
                  <View className="flex-col justify-between text-sm text-white mb-1">
                     <View className="flex-row justify-between mb-1">
                        <Text className="text-white">Compression</Text>
                        <Text className="font-medium text-white">
                           {calcCompressionPercentage(
                              parseInt(video.compressedSize),
                              parseInt(video.originalSize)
                           )}
                           %
                        </Text>
                     </View>

                     <View className="flex-row items-center">
                        <Progress
                           value={calcCompressionPercentage(
                              parseInt(video.compressedSize),
                              parseInt(video.originalSize)
                           )}
                        />
                     </View>
                  </View>
               </View>
            ) : (
               <View className="bg-white/10 text-white px-2 py-1 rounded">
                  <Text>Cannot compress</Text>
               </View>
            )}
            <View className="flex-row items-center justify-between mt-4">
               <Button
                  className="flex-1 bg-white text-black py-2 rounded-xl flex-row items-center justify-center mr-2"
                  onPress={() =>
                     onDownload(getFullVideoUrl(video.publicId), video.publicId)
                  }
               >
                  <Download className="w-4 h-4 mr-2 text-black" />
                  <Text className="text-black">Download</Text>
               </Button>
               <Button
                  onPress={handlerCardDeleteButtonClick}
                  className="bg-white text-white p-2 rounded-xl"
               >
                  {isDeleting ? (
                     <ActivityIndicator size="small" color={"#000000"} />
                  ) : (
                     <Trash className="w-4 h-4 text-black" color={"black"} />
                  )}
               </Button>
            </View>
         </View>
      </View>
   )
}

export default VideoCard
