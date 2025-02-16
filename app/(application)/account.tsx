import { View, Text, TouchableOpacity } from "react-native"
import { useClerk, useUser } from "@clerk/clerk-expo"
import * as Animatable from "react-native-animatable"
import AppVersion from "~/components/version"
import { LogOut, Mail, User } from "lucide-react-native"

export default function AccountScreen() {
   const { signOut } = useClerk()
   const { user } = useUser()

   const handleLogoutPress = async () => await signOut()

   return (
      <View className="flex-1 bg-black">
         <View className="min-h-screen">
            <Animatable.View
               animation="fadeIn"
               className="w-full bg-[#161617] rounded-b-3xl px-6 pt-10 pb-8"
            >
               <View className="items-center">
                  <Animatable.Text
                     animation="fadeInUp"
                     delay={300}
                     className="text-white text-6xl font-bold mt-4"
                  >
                     Account
                  </Animatable.Text>
               </View>
            </Animatable.View>

            <Animatable.View
               animation="fadeInUp"
               delay={500}
               className="px-6 mt-8"
            >
               <Text className="text-gray-400 text-lg mb-4">Details</Text>

               <View className="bg-[#161617] rounded-xl p-4 mb-4">
                  <View className="flex-row items-center mb-4">
                     <User color={"#9ca3af"} />
                     <View className="ml-4">
                        <Text className="text-gray-400 text-sm">Username</Text>
                        <Text className="text-white">
                           {user?.username || "Not set"}
                        </Text>
                     </View>
                  </View>

                  <View className="flex-row items-center">
                     <Mail color={"#9ca3af"} />
                     <View className="ml-4">
                        <Text className="text-gray-400 text-sm">Email</Text>
                        <Text className="text-white">
                           {user?.emailAddresses[0].emailAddress}
                        </Text>
                     </View>
                  </View>
               </View>
            </Animatable.View>

            <View className="px-6 mt-4">
               <TouchableOpacity
                  onPress={handleLogoutPress}
                  className="bg-white  p-4 rounded-xl flex-row items-center justify-center space-x-2 gap-2"
               >
                  <LogOut color={"black"} />
                  <Text className="text-black font-semibold text-lg">
                     Logout
                  </Text>
               </TouchableOpacity>
            </View>

            <AppVersion />
         </View>
      </View>
   )
}
