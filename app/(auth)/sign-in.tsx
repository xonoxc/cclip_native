import React from "react"
import { useSignIn } from "@clerk/clerk-expo"
import { Link, RelativePathString, useRouter } from "expo-router"
import { Input } from "~/components/ui/input"
import { View, Text } from "react-native"
import Logo from "~/components/Logo"
import { Button } from "~/components/ui/button"

export default function Page() {
   const { signIn, setActive, isLoaded } = useSignIn()
   const router = useRouter()

   const [emailAddress, setEmailAddress] = React.useState("")
   const [password, setPassword] = React.useState("")
   const [submitting, setSubmitting] = React.useState<boolean>(false)
   const [error, setError] = React.useState<string>("")

   const onSignInPress = React.useCallback(async () => {
      setError("")
      setSubmitting(true)
      if (!isLoaded) {
         return
      }
      try {
         const signInAttempt = await signIn.create({
            identifier: emailAddress,
            password,
         })

         if (signInAttempt.status === "complete") {
            await setActive({ session: signInAttempt.createdSessionId })
            router.replace("/")
         } else {
            console.error(JSON.stringify(signInAttempt, null, 2))
         }
      } catch (err: any) {
         setError(err.errors[0].message)
      } finally {
         setSubmitting(false)
      }
   }, [isLoaded, emailAddress, password])

   return (
      <View className="flex-1 items-center justify-center">
         <View className="flex-row items-center justify-center mb-10">
            <Logo />
         </View>
         {error && (
            <View className="mb-4 text-red-300">
               <Text className="text-lg text-red-500">{error}</Text>
            </View>
         )}
         <View className="w-full px-10 gap-4">
            <View className="gap-4">
               <Input
                  autoCapitalize="none"
                  value={emailAddress}
                  className="border border-[#cccccc] text-white bg-black rounded-xl p-4"
                  placeholder="Email..."
                  onChangeText={email => setEmailAddress(email)}
               />
               <Input
                  value={password}
                  placeholder="Password..."
                  className="border border-[#cccccc] text-white bg-black  rounded-xl p-4"
                  secureTextEntry={true}
                  onChangeText={password => setPassword(password)}
               />
            </View>
            <Button
               className="text-black p-6 rounded-xl"
               onPress={onSignInPress}
            >
               <Text>{submitting ? "sigining in..." : "Sign In"}</Text>
            </Button>
         </View>

         <View className="w-full px-4  items-center justify-center h-20 rounded-md mt-8">
            <Text className="text-lg text-white mr-2">
               Don't have an account?
            </Text>
            <Link
               href={"/sign-up" as RelativePathString}
               className="text-purple-500 text-3xl"
            >
               <Text>Sign Up</Text>
            </Link>
         </View>
      </View>
   )
}
