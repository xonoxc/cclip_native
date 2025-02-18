import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "~/components/ui/select"
import {
   View,
   Text,
   TouchableOpacity,
   ScrollView,
   ActivityIndicator,
} from "react-native"
import { blurhash } from "~/constants/blur"
import { Upload } from "lucide-react-native"
import { Image } from "expo-image"
import React from "react"
import { useImageTransformScreen } from "~/hooks/screens/useImageScreen"
import { SocialFormat } from "~/constants/formats"

export default function ImageUploadScreen() {
   const {
      imageUri,
      handleImagePick,
      isUploading,
      selectedFormat,
      setSelectedFormat,
      socialFormats,
      url,
      handleDownloadPress,
      setImageUri,
      contentInsets,
      uploadedImagePublicID,
   } = useImageTransformScreen()

   return (
      <ScrollView className="flex-1 bg-black p-4 pb-96">
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
                     className="bg-white p-4 py-4 rounded-xl items-center flex flex-row  justify-center gap-2 space-x-2"
                  >
                     <Upload color={"black"} />
                     <Text className="text-black">Choose an image</Text>
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
                        defaultValue={{
                           value: selectedFormat,
                           label: selectedFormat,
                        }}
                        onValueChange={value =>
                           setSelectedFormat(value?.label as SocialFormat)
                        }
                        className="w-full"
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue
                              className="text-foreground text-sm native:text-lg"
                              placeholder="Select a format"
                           />
                        </SelectTrigger>
                        <SelectContent
                           insets={contentInsets}
                           className="relataive w-[85%]"
                        >
                           <SelectGroup>
                              {Object.keys(socialFormats).map(format => (
                                 <SelectItem
                                    key={format}
                                    value={format}
                                    label={format}
                                 >
                                    {format}
                                 </SelectItem>
                              ))}
                           </SelectGroup>
                        </SelectContent>
                     </Select>

                     <View className="mt-6">
                        {!isUploading && uploadedImagePublicID ? (
                           <>
                              <Text className="text-lg font-semibold text-white mb-2">
                                 Preview:
                              </Text>

                              <ScrollView
                                 contentContainerStyle={{
                                    alignItems: "center",
                                 }}
                              >
                                 {uploadedImagePublicID && url && (
                                    <View>
                                       <Image
                                          source={url}
                                          placeholder={blurhash}
                                          style={{
                                             height: 200,
                                             width: 400,
                                          }}
                                          contentFit="contain"
                                       />
                                    </View>
                                 )}
                                 <Text className="text-white text-sm mt-2 bg-[#0f1014] p-2 rounded-xl outline-1">
                                    {socialFormats[selectedFormat].width} x
                                    {socialFormats[selectedFormat].height}
                                 </Text>
                              </ScrollView>
                           </>
                        ) : (
                           <View>
                              <Text>Loading...</Text>
                           </View>
                        )}
                     </View>

                     <View className="flex-row px-2 mt-6 w-full justify-between">
                        <TouchableOpacity
                           onPress={() => setImageUri(null)}
                           className="bg-white p-4  rounded-xl"
                        >
                           <Text className="text-black">Remove</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={handleDownloadPress}
                           className="bg-white  p-4 rounded-xl"
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
