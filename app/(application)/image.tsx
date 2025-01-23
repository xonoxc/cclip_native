import { SocialFormat, socialFormats } from "@/constants/formats"
import React, { useCallback, useState } from "react"
import * as FileSystem from "expo-file-system"

import * as Sharing from "expo-sharing"
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Upload } from "lucide-react-native"
import { apiClient } from "@/lib/apiClient"
import Select from "react-native-picker-select"

export default function ImageUploadScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [_, setUploadedImage] = useState<string | null>(null)
    const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
        "Instagram Square (1:1)"
    )
    const [isUploading, setIsUploading] = useState<boolean>(false)

    const handleImagePick = useCallback(async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permission.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: false,
                quality: 1,
            })
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedURI = result.assets[0].uri
                setImageUri(pickedURI)
                await uploadImage(pickedURI)
            }
        } else {
            alert("Permission to access media library is required!")
        }
    }, [])

    const uploadImage = useCallback(async (uri: string) => {
        try {
            setIsUploading(true)

            const response = await fetch(uri)
            const blob = await response.blob()

            const data = new FormData()
            data.append("file", blob)

            const serverResponse = await apiClient.post(
                "/api/imageupload",
                data
            )
            if (serverResponse.status === 200) {
                setUploadedImage(serverResponse.data.publicId as string)
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message)
            }
            Alert.alert(
                "Upload Failed",
                "There was an error uploading your image. Please try again."
            )
        } finally {
            setIsUploading(false)
        }
    }, [])

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

            const { uri } = await FileSystem.downloadAsync(
                imageUri as string,
                fileURI
            )

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
                                    setSelectedFormat(
                                        value || "Instagram Square (1:1)"
                                    )
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

                                <View className="items-center">
                                    <Image
                                        source={{ uri: imageUri }}
                                        className="w-full h-96 rounded-md"
                                        resizeMode="contain"
                                    />
                                </View>
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
