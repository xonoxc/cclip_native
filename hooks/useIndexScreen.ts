import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Video } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import { apiClient } from "~/lib/apiClient"
import { AxiosError } from "axios"
import { Alert } from "react-native"

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

   useEffect(() => {
      fetchVideos()
   }, [])

   const handleDeletePress = useCallback(
      async (videoId: string, public_id: string) => {
         try {
            const deleteResponse = await apiClient.delete("/api/videos", {
               data: {
                  videoId,
                  public_id,
               },
            })

            if (deleteResponse.status === 200) {
               setVideos(prev => prev.filter(video => video.id !== videoId))
            }
         } catch (e) {
            if (e instanceof AxiosError) {
               console.error("error deleting video", e.message)
               return
            }
            console.log("error:", JSON.stringify(e))
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
