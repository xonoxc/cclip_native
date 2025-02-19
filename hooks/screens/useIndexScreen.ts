import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Video } from "@prisma/client"
import { useCallback, useState } from "react"
import { apiClient } from "~/lib/apiClient"
import { AxiosError } from "axios"
import { Alert } from "react-native"
import { useFocusEffect } from "expo-router"

export const useIndexScreen = () => {
   const [videos, setVideos] = useState<Video[]>([])
   const [loading, setLoading] = useState<boolean>(true)
   const [error, setError] = useState<string | null>("")

   const fetchVideos = useCallback(async () => {
      if (!loading) setLoading(true)
      try {
         const response = await apiClient.get("/api/videos")
         if (Array.isArray(response.data)) {
            setVideos(response.data)
         } else {
            throw new Error("Unexpected data format")
         }
      } catch (error) {
         console.log(error)
         setError("Failed to fetch videos")
      } finally {
         setLoading(false)
      }
   }, [])

   useFocusEffect(() => {
      fetchVideos()
   })

   const handleDeletePress = useCallback(
      async (videoId: string, publicId: string) => {
         try {
            const deleteVideoResponse = await apiClient.delete(
               `/api/videos?video_id=${videoId}&public_id=${publicId}`
            )

            if (deleteVideoResponse.status === 200) {
               setVideos(prevVideos =>
                  prevVideos.filter(video => video.id !== videoId)
               )
            }
         } catch (e) {
            if (e instanceof AxiosError) {
               console.error("VideoDeleteError:", e.response?.data.error)
            } else {
               console.error("Unexpected Error:", e)
            }
         }
      },
      []
   )

   const handleDownloadPress = useCallback(
      async (url: string, title: string) => {
         const directory = `${FileSystem.documentDirectory}downloads/`

         try {
            const dirInfo = await FileSystem.getInfoAsync(directory)
            if (!dirInfo.exists) {
               await FileSystem.makeDirectoryAsync(directory, {
                  intermediates: true,
               })
            }

            const fileURI = directory + `${title}.mp4`

            const { uri } = await FileSystem.downloadAsync(url, fileURI)

            if (await Sharing.isAvailableAsync()) {
               await Sharing.shareAsync(uri)
            } else {
               Alert.alert(
                  "Download Complete",
                  "The file has been saved to your device."
               )
            }
         } catch (error) {
            console.error("Download error:", error)
            Alert.alert("Error", "Failed to download the file.")
         }
      },
      []
   )

   return {
      loading,
      error,
      videos,
      handleDeletePress,
      handleDownloadPress,
      fetchVideos,
   }
}
