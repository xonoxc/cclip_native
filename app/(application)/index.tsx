import { View, Text, ActivityIndicator, FlatList } from "react-native"
import VideoCard from "~/components/ui/videoCard"
import { useIndexScreen } from "~/hooks/screens/useIndexScreen"
import { RefreshControl } from "react-native-gesture-handler"

export default function HomeScreen() {
   const {
      loading,
      videos,
      handleDownloadPress,
      handleDeletePress,
      error,
      fetchVideos,
   } = useIndexScreen()

   return (
      <View className="flex-1 bg-black p-4  h-screen-safe">
         <Text className="text-6xl font-bold my-4 text-white">Videos</Text>

         {loading ? (
            <View className="flex-1 justify-center items-center">
               <ActivityIndicator
                  size="large"
                  className="bg-black text-white"
               />
            </View>
         ) : videos.length === 0 ? (
            <View className="flex-1 justify-center items-center">
               {error ? (
                  <Text className="text-red-500 mb-4">{error}</Text>
               ) : (
                  <Text className="text-white">No videos available</Text>
               )}
            </View>
         ) : (
            <View style={{ minHeight: 2 }}>
               <FlatList
                  data={videos}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                     <VideoCard
                        video={item}
                        onDownload={handleDownloadPress}
                        onDelete={handleDeletePress}
                     />
                  )}
                  refreshControl={
                     <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchVideos}
                     />
                  }
                  disableVirtualization
                  contentContainerStyle={{ paddingBottom: 140 }}
               />
            </View>
         )}
      </View>
   )
}
