import { View, Text, TouchableOpacity } from "react-native"
import { useClerk, useUser } from "@clerk/clerk-expo"

export default function AccountScreen() {
    const { signOut } = useClerk()

    const { user } = useUser()

    const handleLogoutPress = async () => await signOut()

    console.log("user:", user?.imageUrl)

    return (
        <View className="flex-1 items-center justify-center gap-3 px-10">
            <Text className="text-white">Logout Screen</Text>
            <TouchableOpacity
                onPress={handleLogoutPress}
                className="text-black bg-white p-4 rounded-lg"
            >
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}
