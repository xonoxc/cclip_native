import { SocialFormat, socialFormats } from "~/constants/formats"
import React, { useCallback, useState } from "react"
import * as FileSystem from "expo-file-system"

import * as Sharing from "expo-sharing"
import {
   View,
   Text,
   TouchableOpacity,
   ScrollView,
   ActivityIndicator,
   Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { blurhash } from "~/constants/blur"
import { Upload } from "lucide-react-native"
import Select from "react-native-picker-select"
import { Image } from "expo-image"
import { useImageTransformation } from "~/hooks/useTransformation"

import axios from "axios"
import { apiClient } from "~/lib/apiClient"

export default function ImageUploadScreen() {
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
      async (uri: string) => {
         try {
            if (!uri) {
               Alert.alert("Error", "No image selected")
               return
            }

            setIsUploading(true)

            const formData = new FormData()

            formData.append("file", {
               uri: uri,
               type: "image/jpeg",
               name: "image.jpg",
            } as any)

            formData.append("upload_preset", "cclip_native")
            formData.append("folder", "cclip")
            formData.append("timestamp", (Date.now() / 1000).toString())

            const uploadResponse = await apiClient.post(
               "/imageupload",
               formData,
               {
                  headers: {
                     "Content-Type": "multipart/form-data",
                  },
               }
            )

            if (uploadResponse.status === 200) {
               setUploadedImagePublicID(uploadResponse.data.public_id)
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

   return (
      <ScrollView className="flex-1 bg-black p-4">
         <View className="mb-6 flex-1 items-start">
            <Text className="text-6xl font-bold text-[#cccccc] mt-2 ">
               Image
            </Text>
         </View>

         <View className="bg-[#161717] rounded-2xl p-4">
            {!imageUri && (
               <>
                  <Text className="text-lg font-bold text-white mb-4">
                     Upload an Image
                  </Text>

                  <TouchableOpacity
                     onPress={handleImagePick}
                     className="bg-gray-700 p-4 py-4 rounded-xl items-center flex flex-row  justify-center gap-2 space-x-2"
                  >
                     <Upload color={"white"} />
                     <Text className="text-white">Choose an image</Text>
                  </TouchableOpacity>
               </>
            )}

            {isUploading && (
               <View className="mt-4">
                  <ActivityIndicator size="large" color="#ffffff" />
               </View>
            )}

            <ScrollView>
               {imageUri && (
                  <View className="mt-6">
                     <Text className="text-lg font-bold text-white mb-4">
                        Select Social Media Format
                     </Text>

                     <Select
                        onValueChange={value =>
                           setSelectedFormat(value || "Instagram Square (1:1)")
                        }
                        items={Object.keys(socialFormats).map(item => ({
                           label: item,
                           value: item,
                        }))}
                        placeholder={{
                           label: selectedFormat,
                           value: selectedFormat,
                        }}
                     />

                     <View className="mt-6">
                        <Text className="text-lg font-semibold text-white mb-2">
                           Preview:
                        </Text>

                        <ScrollView
                           contentContainerStyle={{
                              alignItems: "center",
                           }}
                        >
                           {uploadedImagePublicID && url && (
                              <Image
                                 source={url}
                                 style={{
                                    width: 100,
                                    height: 100,
                                 }}
                                 placeholder={blurhash}
                              />
                           )}
                        </ScrollView>
                     </View>

                     <View className="flex-row px-2 mt-6 w-full justify-between">
                        <TouchableOpacity
                           onPress={() => setImageUri(null)}
                           className="bg-white p-4  rounded-md"
                        >
                           <Text className="text-black">Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={handleDownloadPress}
                           className="bg-white  p-4 rounded-md"
                        >
                           <Text className="text-black">Download</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               )}
            </ScrollView>
         </View>
      </ScrollView>
   )
}
