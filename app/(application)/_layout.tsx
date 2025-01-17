import { Redirect, RelativePathString, Tabs } from "expo-router"
import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { Platform } from "react-native"
import { HapticTab } from "@/components/HapticTab"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useAuth } from "@clerk/clerk-expo"
import {
    CircleUserRound,
    FileImage,
    FileVideo2,
    House,
} from "lucide-react-native"

export default function ApplicationLayout() {
    const colorScheme = useColorScheme()
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return <Redirect href={"/sign-in" as RelativePathString} />
    }

    return (
        <SafeAreaView className="flex-1">
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                    headerShown: true,
                    animation: "shift",
                    tabBarButton: HapticTab,
                    tabBarBackground: TabBarBackground,
                    tabBarStyle: Platform.select({
                        ios: {
                            position: "absolute",
                        },
                        default: {
                            position: "absolute",
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
    )
}
