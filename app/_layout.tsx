import "~/global.css"

import { useFonts } from "expo-font"
import {
   DarkTheme,
   DefaultTheme,
   Theme,
   ThemeProvider,
} from "@react-navigation/native"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import useToken from "~/hooks/useToken"
import * as React from "react"
import * as SplashScreen from "expo-splash-screen"
import { Platform } from "react-native"
import { NAV_THEME } from "~/lib/constants"
import { useColorScheme } from "~/lib/useColorScheme"
import { PortalHost } from "@rn-primitives/portal"
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar"
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo"

const LIGHT_THEME: Theme = {
   ...DefaultTheme,
   colors: NAV_THEME.light,
}
const DARK_THEME: Theme = {
   ...DarkTheme,
   colors: NAV_THEME.dark,
}

SplashScreen.preventAutoHideAsync()

export { ErrorBoundary } from "expo-router"

export default function RootLayout() {
   const hasMounted = React.useRef(false)
   const { colorScheme, isDarkColorScheme } = useColorScheme()
   const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false)

   const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
   if (!publishableKey) {
      throw new Error("Missing clerk publishable key!")
   }

   const { tokenCache } = useToken()

   useIsomorphicLayoutEffect(() => {
      if (hasMounted.current) {
         return
      }

      setAndroidNavigationBar(colorScheme)
      setIsColorSchemeLoaded(true)
      hasMounted.current = true
   }, [])

   const [loaded] = useFonts({
      SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
   })

   React.useEffect(() => {
      if (loaded) {
         SplashScreen.hideAsync()
      }
   }, [loaded])

   if (!isColorSchemeLoaded || !loaded) {
      return null
   }

   return (
      <>
         <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
               <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
               <ClerkLoaded>
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
               </ClerkLoaded>
               <PortalHost />
            </ThemeProvider>
            <PortalHost />
         </ClerkProvider>
      </>
   )
}

const useIsomorphicLayoutEffect =
   Platform.OS === "web" && typeof window === "undefined"
      ? React.useLayoutEffect
      : React.useEffect
