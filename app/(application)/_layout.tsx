import { Redirect, RelativePathString, Tabs } from "expo-router"
import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Platform } from "react-native"
import { Colors } from "~/constants/colors"
import { useColorScheme } from "~/lib/useColorScheme"
import TabBarBackground from "~/components/ui/tabBarBackground"
import { useAuth } from "@clerk/clerk-expo"
import {
   CircleUserRound,
   FileImage,
   FileVideo2,
   House,
} from "lucide-react-native"
import { HapticTab } from "~/components/HapticTab"
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function ApplicationLayout() {
   const { colorScheme } = useColorScheme()
   const { isSignedIn } = useAuth()

   if (!isSignedIn) {
      return <Redirect href={"/sign-in" as RelativePathString} />
   }

   return (
      <GestureHandlerRootView>
         <SafeAreaView className="flex-1">
            <Tabs
               screenOptions={{
                  tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                  headerShown: true,
                  tabBarHideOnKeyboard: true,
                  animation: "shift",
                  tabBarButton: HapticTab,
                  tabBarBackground: TabBarBackground,
                  tabBarStyle: Platform.select({
                     ios: {
                        position: "absolute",
                     },
                     default: {
                        position: "absolute",
                        flex: 1,
                        bottom: 5,
                        paddingTop: 10,
                        alignItems: "center",
                        height: 70,
                        marginHorizontal: 10,
                        left: 0,
                        right: 0,
                        backgroundColor:
                           Colors[colorScheme ?? "light"].background,
                        borderRadius: 22,
                        elevation: 6,
                     },
                  }),
               }}
            >
               <Tabs.Screen
                  name="index"
                  options={{
                     title: "Home",
                     headerShown: false,
                     tabBarIcon: ({ color }) => <House color={color} />,
                  }}
               />
               <Tabs.Screen
                  name="image"
                  options={{
                     title: "Image Upload",
                     headerShown: false,
                     tabBarIcon: ({ color }) => <FileImage color={color} />,
                  }}
               />

               <Tabs.Screen
                  name="video"
                  options={{
                     title: "Video Upload",
                     headerShown: false,
                     tabBarIcon: ({ color }) => <FileVideo2 color={color} />,
                  }}
               />

               <Tabs.Screen
                  name="account"
                  options={{
                     title: "account",
                     headerShown: false,
                     tabBarIcon: ({ color }) => (
                        <CircleUserRound color={color} />
                     ),
                  }}
               />
            </Tabs>
         </SafeAreaView>
      </GestureHandlerRootView>
   )
}
