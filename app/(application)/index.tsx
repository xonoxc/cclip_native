import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { Video } from "@prisma/client/react-native"
import { useCallback, useEffect, useState } from "react"
import {
    View,
    Text,
    Alert,
    ActivityIndicator,
    FlatList,
    RefreshControl,
} from "react-native"
import VideoCard from "@/components/ui/VideoCard"
import { apiClient } from "@/lib/apiClient"
import { ScrollView } from "tamagui"

export default function HomeScreen() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>("")

    const fetchVideos = useCallback(async () => {
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
    }, [fetchVideos])

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
                    setVideos(prev =>
                        prev.filter(video => video.id !== videoId)
                    )
                }
            } catch (error) {
                console.error("Error while deleting video:", error)
            }
        },
        []
    )

    const handleDownloadPress = useCallback(
        async (url: string, title: string) => {
            try {
                const fileUri = `${FileSystem.documentDirectory}${title}.mp4`

                const { uri } = await FileSystem.downloadAsync(url, fileUri)

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

    return (
        <ScrollView
            className="flex-1 bg-black p-4 border-2 h-screen-safe border-white"
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchVideos} />
            }
        >
            <Text className="text-2xl font-bold mb-4 text-white">Videos</Text>
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            ) : videos.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg text-gray-500">
                        {error ? (
                            <Text className="text-red-500 mb-4">{error}</Text>
                        ) : (
                            <Text>No videos available</Text>
                        )}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <VideoCard
                            video={item}
                            onDownload={handleDownloadPress}
                            onDelete={handleDeletePress}
                            className="mb-6"
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    numColumns={2}
                />
            )}
        </ScrollView>
    )
}
