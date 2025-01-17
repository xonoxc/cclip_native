import { SocialFormat } from "@/constants/formats"
import React, { useCallback, useState } from "react"
import { View, Text } from "react-native"
import ImagePicker from "expo-image-picker"

export default function ImageUploadScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [isDialogueVisible, setIsDialogueVisible] = useState<boolean>(false)
    const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
        "Instagram Square (1:1)"
    )

    const handleImagePick = useCallback(async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permission.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })
            if (!result.canceled) setImageUri(result.assets[0].uri)
        } else {
            alert("Permission to access media library is required!")
        }
    }, [])

    const handleDownloadPress = useCallback(() => {}, [])

    return (
        <View className="">
            <Text className="text-white">Image Upload Screen</Text>
        </View>
    )
}
