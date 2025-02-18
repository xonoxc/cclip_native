import React from "react"
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
} from "react-native"
import {
   Type,
   Video,
   FileUp,
   FileVideo2,
   AlertCircle,
   FileText,
   X,
} from "lucide-react-native"
import { useVideoUploadScreen } from "~/hooks/screens/useVideoScreen"

export default function VideoUpload() {
   const {
      setDescription,
      setTitle,
      setErrors,
      description,
      errors,
      cancelSource,
      setIsUploading,
      createVideo,
      isUploading,
      fileUri,
      title,
      setFileUri,
      handleFilePick,
      setFileName,
      setFileSize,
      fileName,
   } = useVideoUploadScreen()

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
