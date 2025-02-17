import React, { useState, useCallback, useMemo } from "react"
import { Progress } from "~/components/ui/progress"
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import {
   Type,
   Video,
   FileUp,
   FileVideo2,
   AlertCircle,
   FileText,
   X,
} from "lucide-react-native"
import * as VideoPicker from "expo-image-picker"
import { apiClient } from "~/lib/apiClient"
import axios, { AxiosError } from "axios"

type FormErrors = { [key: string]: string }

export default function VideoUpload() {
   const [fileUri, setFileUri] = useState<string | null>(null)
   const [fileName, setFileName] = useState<string>("")
   const [fileSize, setFileSize] = useState<number>(0)
   const [title, setTitle] = useState<string>("")
   const [description, setDescription] = useState<string>("")
   const [isUploading, setIsUploading] = useState<boolean>(false)
   const [uploadProgress, setUploadProgress] = useState<number>(0)
   const [errors, setErrors] = useState<FormErrors>({
      title: "",
      description: "",
      File: "",
   })

   const router = useRouter()
   const MAX_FILE_SIZE = useMemo(() => 70 * 1024 * 1024, [])
   const cancelSource = axios.CancelToken.source()

   const isValidData = useCallback((): boolean => {
      const validationErrors: FormErrors = {}

      if (!title.trim()) {
         validationErrors.title = "Title is required"
      }

      if (!fileUri) {
         validationErrors.file = "File is required"
      }

      if (!description.trim()) {
         validationErrors.description = "Description is required"
      }

      setErrors(prev => ({ ...prev, ...validationErrors }))
      return Object.keys(validationErrors).length === 0
   }, [title, fileUri, description])

   const createVideo = useCallback(async () => {
      if (!isValidData()) return

      setIsUploading(true)
      try {
         const formData = new FormData()

         formData.append("file", {
            uri: fileUri,
            type: "video/mp4",
            name: fileName,
         } as any)

         formData.append("upload_preset", "cclip_native")
         formData.append("folder", "cclip")
         formData.append("timestamp", (Date.now() / 1000).toString())

         const uploadResp = await apiClient.post(
            `/api/video-upload`,
            formData,
            {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
               onUploadProgress: progressEvent => {
                  const { loaded, total } = progressEvent
                  if (loaded && total) {
                     const percent = Math.floor((loaded * 100) / total)
                     setUploadProgress(percent)
                  }
               },
            }
         )

         if (uploadResp.status === 200) {
            router.push("/video")
         }
      } catch (e) {
         if (axios.isCancel(e)) {
            return
         } else if (e instanceof AxiosError) {
            console.log(JSON.stringify(e))
         }
         console.log("error", e)
      } finally {
         setIsUploading(false)
      }
   }, [fileUri, title, description, isValidData, fileSize, fileName])

   const handleFilePick = async () => {
      try {
         const permission =
            await VideoPicker.requestMediaLibraryPermissionsAsync()
         if (!permission.granted) {
            alert("Permission to access media library is required!")
            return
         }

         const result = await VideoPicker.launchImageLibraryAsync({
            mediaTypes: "videos",
            allowsEditing: false,
            quality: 1,
         })

         if (result.canceled || !result.assets?.[0]?.uri) return

         const asset = result.assets[0]

         if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            setErrors(prev => ({
               ...prev,
               file: "File size exceeds 70MB limit",
            }))
            return
         }

         setFileUri(asset.uri)
         setFileName(asset.fileName || "")
         setFileSize(asset.fileSize || 0)
         setErrors(prev => ({ ...prev, file: "" }))
      } catch (e) {
         console.error("File pick error:", e)
         setErrors(prev => ({
            ...prev,
            file: "Failed to select video file",
         }))
      }
   }

   return (
      <KeyboardAvoidingView
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         className="flex-1 bg-black"
         keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
         <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
         >
            <View className="flex-1 bg-black pt-4 px-4">
               <View className="w-full bg-black rounded-2xl">
                  <View className="flex-row items-center gap-3 mb-4">
                     <Video size={28} color="white" />
                     <Text className="text-4xl font-bold text-gray-300">
                        Upload Video
                     </Text>
                  </View>

                  <View className="space-y-6 pb-8">
                     {/* Title Input */}
                     <View>
                        <Text className="text-sm font-medium text-gray-400 mb-2">
                           Title
                        </Text>
                        <View className="bg-[#161717] rounded-xl p-1">
                           <View className="flex-row items-center gap-2">
                              <View className="ml-3">
                                 <Type color="#6b7280" size={20} />
                              </View>
                              <TextInput
                                 value={title}
                                 onChangeText={(text: string) => {
                                    setTitle(text)
                                    if (errors.title)
                                       setErrors(prev => ({
                                          ...prev,
                                          title: "",
                                       }))
                                 }}
                                 placeholder="Enter video title..."
                                 className="flex-1 text-gray-300 text-base"
                                 placeholderTextColor="#6b7280"
                              />
                           </View>
                        </View>
                        {errors.title && (
                           <View className="flex-row items-center gap-1 mt-1">
                              <AlertCircle size={14} color="#ef4444" />
                              <Text className="text-red-500 text-sm">
                                 {errors.title}
                              </Text>
                           </View>
                        )}
                     </View>

                     {/* File Input */}
                     <View>
                        <Text className="text-sm font-medium text-gray-400 mb-2">
                           Video File
                        </Text>
                        <TouchableOpacity
                           onPress={handleFilePick}
                           className="bg-[#161717] rounded-xl p-4 flex-row items-center justify-between active:opacity-80"
                        >
                           <View className="flex-row items-center gap-3">
                              {fileUri ? (
                                 <>
                                    <FileVideo2 color="#fff" size={20} />
                                    <Text className="text-gray-300 text-base">
                                       {fileName}
                                    </Text>
                                 </>
                              ) : (
                                 <>
                                    <FileUp color="#6b7280" size={20} />
                                    <Text className="text-[#6b7280] text-base">
                                       Select video file
                                    </Text>
                                 </>
                              )}
                           </View>
                           {fileUri && (
                              <TouchableOpacity
                                 onPress={() => {
                                    setFileUri("")
                                    setFileName("")
                                    setFileSize(0)
                                    setErrors(prev => ({
                                       ...prev,
                                       file: "",
                                    }))
                                 }}
                              >
                                 <X color="#ffffff" size={20} />
                              </TouchableOpacity>
                           )}
                        </TouchableOpacity>
                        {errors.file && (
                           <View className="flex-row items-center gap-1 mt-1">
                              <AlertCircle size={14} color="#ef4444" />
                              <Text className="text-red-500 text-sm">
                                 {errors.file}
                              </Text>
                           </View>
                        )}
                     </View>

                     {/* Description Input */}
                     <View>
                        <Text className="text-sm font-medium text-gray-400 mb-2">
                           Description
                        </Text>
                        <View className="bg-[#161717] rounded-xl p-3">
                           <View className="flex-row items-start ">
                              <View className="pt-2 px-1">
                                 <FileText color="#6b7280" size={20} />
                              </View>
                              <TextInput
                                 value={description}
                                 onChangeText={(text: string) => {
                                    setDescription(text)
                                    if (errors.description)
                                       setErrors(prev => ({
                                          ...prev,
                                          description: "",
                                       }))
                                 }}
                                 placeholder="Enter video description..."
                                 className="flex-1 text-gray-300 text-base h-32"
                                 multiline
                                 placeholderTextColor="#6b7280"
                                 textAlignVertical="top"
                              />
                           </View>
                        </View>
                        {errors.description && (
                           <View className="flex-row items-center gap-1 mt-1">
                              <AlertCircle size={14} color="#ef4444" />
                              <Text className="text-red-500 text-sm">
                                 {errors.description}
                              </Text>
                           </View>
                        )}
                     </View>

                     {isUploading && uploadProgress && (
                        <View className="my-3">
                           <Progress value={uploadProgress} />
                           <Text className="text-white">
                              {uploadProgress}% uploaded
                           </Text>
                        </View>
                     )}
                     <View className="space-y-3">
                        {isUploading && (
                           <TouchableOpacity
                              onPress={() => {
                                 cancelSource.cancel()
                                 setIsUploading(false)
                              }}
                              className="w-full bg-red-500/90 py-4 rounded-xl active:opacity-80"
                           >
                              <Text className="text-white text-center font-semibold text-base">
                                 Cancel Upload
                              </Text>
                           </TouchableOpacity>
                        )}

                        <View className="mt-5">
                           <TouchableOpacity
                              onPress={() => createVideo()}
                              disabled={isUploading}
                              className={`w-full py-4 rounded-xl ${
                                 isUploading
                                    ? "bg-gray-400/80"
                                    : "bg-white active:opacity-80"
                              }`}
                           >
                              <Text
                                 className={`text-center font-semibold text-base ${
                                    isUploading ? "text-gray-600" : "text-black"
                                 }`}
                              >
                                 {isUploading ? "Uploading..." : "Upload Video"}
                              </Text>
                           </TouchableOpacity>
                        </View>
                     </View>
                  </View>
               </View>
            </View>
         </ScrollView>
      </KeyboardAvoidingView>
   )
}
