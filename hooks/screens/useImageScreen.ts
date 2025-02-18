import { useCallback, useMemo, useState } from "react"
import axios from "axios"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as FileSystem from "expo-file-system"
import * as ImagePicker from "expo-image-picker"
import { Alert } from "react-native"
import * as Sharing from "expo-sharing"

import { useImageTransformation } from "~/hooks/useTransformation"
import { socialFormats, SocialFormat } from "~/constants/formats"

export function useImageTransformScreen() {
   const [imageUri, setImageUri] = useState<string | null>(null)
   const [uploadedImagePublicID, setUploadedImagePublicID] = useState<
      string | null
   >(null)
   const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
      "Instagram Square (1:1)"
   )
   const [isUploading, setIsUploading] = useState<boolean>(false)

   const { url } = useImageTransformation({
      width: socialFormats[selectedFormat].width,
      height: socialFormats[selectedFormat].height,
      aspectRatio: socialFormats[selectedFormat].aspectRatio,
      publicID: uploadedImagePublicID!,
   })

   const insets = useSafeAreaInsets()
   const contentInsets = useMemo(
      () => ({
         top: insets.top,
         bottom: insets.bottom,
         left: 0,
         right: 16,
      }),
      []
   )

   const handleImagePick = useCallback(async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (permission.granted) {
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: false,
            quality: 1,
         })
         if (
            !result.canceled &&
            result.assets &&
            result.assets.length > 0 &&
            result.assets[0].uri
         ) {
            const pickedURI = result.assets[0].uri
            setImageUri(pickedURI)
            await handleImageUpload(pickedURI)
         }
      } else {
         alert("Permission to access media library is required!")
      }
   }, [])

   const handleImageUpload = useCallback(
      async (fileUri: string) => {
         try {
            if (!fileUri) {
               Alert.alert("Error", "No image selected")
               setImageUri(null)
               return
            }

            setIsUploading(true)

            const fileInfo = await FileSystem.getInfoAsync(fileUri)
            if (!fileInfo.exists) {
               throw new Error("File not found")
            }

            const response = await FileSystem.uploadAsync(
               `${process.env.EXPO_PUBLIC_SERVER_URL!}/api/image-upload`,
               fileUri,
               {
                  httpMethod: "POST",
                  uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                  fieldName: "file",
               }
            )

            if (response.status === 200) {
               const { publicId } = JSON.parse(response.body) as {
                  publicId: string
               }
               setUploadedImagePublicID(publicId)
            }
         } catch (e) {
            if (axios.isAxiosError(e)) {
               console.error("Upload failed:", e.response?.data || e.message)
               Alert.alert(
                  "Upload Failed",
                  e.response?.data?.message || "Unknown error"
               )
            } else {
               console.error("Unexpected error:", e)
               Alert.alert("Error", "Unexpected error during upload")
            }
         } finally {
            setIsUploading(false)
         }
      },
      [imageUri]
   )

   const handleDownloadPress = useCallback(async () => {
      const directory = `${FileSystem.documentDirectory}downloads/`

      try {
         const dirInfo = await FileSystem.getInfoAsync(directory)
         if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(directory, {
               intermediates: true,
            })
         }

         const fileURI = directory + "image.jpg"

         const { uri } = await FileSystem.downloadAsync(url as string, fileURI)

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
   }, [])

   return {
      imageUri,
      setImageUri,
      handleDownloadPress,
      url,
      socialFormats,
      setSelectedFormat,
      selectedFormat,
      isUploading,
      handleImagePick,
      contentInsets,
      uploadedImagePublicID,
   }
}
