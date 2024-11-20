import { useState } from "react"
import { Input, Button, Text } from "tamagui"
import { View } from "react-native"
import { useSignUp } from "@clerk/clerk-expo"
import { Link, useRouter } from "expo-router"
import Logo from "@/components/Logo"

interface FormState {
    emailAddress: string
    password: string
    pendingVerification: boolean
    code: string
}

export default function SignUpScreen(): JSX.Element {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [formState, setFormState] = useState<FormState>({
        emailAddress: "",
        password: "",
        pendingVerification: false,
        code: "",
    })
    const [error, setError] = useState<string>("")
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [verifying, setVerifying] = useState<boolean>(false)

    const onSignUpPress = async (): Promise<void> => {
        setError("")
        setSubmitting(true)
        if (!isLoaded) {
            return
        }

        try {
            await signUp.create({
                emailAddress: formState.emailAddress,
                password: formState.password,
            })

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            })

            setFormState(prevState => ({
                ...prevState,
                pendingVerification: true,
            }))
        } catch (error: any) {
            console.error(JSON.stringify(error, null, 2))
            setError(error.errors[0].message)
        } finally {
            setSubmitting(false)
        }
    }

    const onPressVerify = async (): Promise<void> => {
        setVerifying(true)
        if (!isLoaded) {
            return
        }

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification(
                {
                    code: formState.code,
                }
            )

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId })
                router.replace("/")
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2))
            }
        } catch (error: any) {
            console.error(JSON.stringify(error, null, 2))
        } finally {
            setVerifying(false)
        }
    }

    return (
        <View className="flex-1 items-center justify-center w-full">
            <View className="flex-row items-center justify-center mb-10">
                <Logo />
            </View>
            {error && <View className="mb-4 text-red-300">{error}</View>}
            <View className="w-full px-10">
                {!formState.pendingVerification ? (
                    <>
                        <View className="gap-2 mb-4">
                            <Input
                                autoCapitalize="none"
                                value={formState.emailAddress}
                                placeholder="Email..."
                                borderColor={"gray"}
                                backgroundColor={"black"}
                                color={"white"}
                                onChangeText={email =>
                                    setFormState(prev => ({
                                        ...prev,
                                        emailAddress: email,
                                    }))
                                }
                            />
                            <Input
                                value={formState.password}
                                placeholder="Password..."
                                borderColor={"gray"}
                                backgroundColor={"black"}
                                color={"white"}
                                secureTextEntry={true}
                                onChangeText={password =>
                                    setFormState(prev => ({
                                        ...prev,
                                        password: password,
                                    }))
                                }
                            />
                        </View>

                        <Button onPress={onSignUpPress}>
                            {submitting ? "signing up..." : "Sign Up"}
                        </Button>
                    </>
                ) : (
                    <View>
                        <Input
                            value={formState.code}
                            placeholder="Code..."
                            borderColor={"gray"}
                            backgroundColor={"black"}
                            color={"white"}
                            onChangeText={code =>
                                setFormState(prev => ({
                                    ...prev,
                                    code: code,
                                }))
                            }
                        />
                        <Button onPress={onPressVerify}>
                            {verifying ? "verifying..." : "Verify"}
                        </Button>
                    </View>
                )}
            </View>

            <View className="w-full px-4 items-center justify-center h-20 rounded-md mt-8">
                <Text className="text-lg mr-2 text-white" color={"white"}>
                    Already have an account?
                </Text>
                <Link className="text-purple-500 text-3xl" href="/sign-in">
                    Sign In
                </Link>
            </View>
        </View>
    )
}
