import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo"
import { createTamagui, TamaguiProvider } from "tamagui"
import defaultConfig from "@tamagui/config/v3"
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import useToken from "@/hooks/useToken"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"
import "../global.css"

import { useColorScheme } from "@/hooks/useColorScheme"

SplashScreen.preventAutoHideAsync()

const config = createTamagui(defaultConfig)

export default function RootLayout() {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
    if (!publishableKey) {
        throw new Error("Missing clerk publishable key!")
    }

    const { tokenCache } = useToken()

    const colorScheme = useColorScheme()
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    })

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync()
        }
    }, [loaded])

    if (!loaded) {
        return null
    }

    return (
        <TamaguiProvider config={config}>
            <ClerkProvider
                publishableKey={publishableKey}
                tokenCache={tokenCache}
            >
                <ClerkLoaded>
                    <ThemeProvider
                        value={
                            colorScheme === "dark" ? DarkTheme : DefaultTheme
                        }
                    >
                        <Stack>
                            <Stack.Screen
                                name="(auth)"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen name="+not-found" />

                            <Stack.Screen
                                name="(application)"
                                options={{ headerShown: false }}
                            />
                        </Stack>

                        <StatusBar style="auto" animated />
                    </ThemeProvider>
                </ClerkLoaded>
            </ClerkProvider>
        </TamaguiProvider>
    )
}
