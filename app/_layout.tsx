import "~/global.css"

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
import { Platform } from "react-native"
import { NAV_THEME } from "~/lib/constants"
import { useColorScheme } from "~/lib/useColorScheme"
import { PortalHost } from "@rn-primitives/portal"
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar"
import { ClerkProvider } from "@clerk/clerk-expo"

const LIGHT_THEME: Theme = {
   ...DefaultTheme,
   colors: NAV_THEME.light,
}
const DARK_THEME: Theme = {
   ...DarkTheme,
   colors: NAV_THEME.dark,
}

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

   if (!isColorSchemeLoaded) {
      return null
   }

   return (
      <>
         <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <ClerkProvider
               publishableKey={publishableKey}
               tokenCache={tokenCache}
            >
               <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
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
               <PortalHost />
            </ClerkProvider>
         </ThemeProvider>
         <PortalHost />
      </>
   )
}

const useIsomorphicLayoutEffect =
   Platform.OS === "web" && typeof window === "undefined"
      ? React.useEffect
      : React.useLayoutEffect
