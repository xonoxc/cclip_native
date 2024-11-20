import { View, Text, TouchableOpacity } from "react-native"
import { useClerk } from "@clerk/clerk-expo"

export default function LogoutScreen() {
    const { signOut } = useClerk()

    const handleLogoutPress = async () => await signOut()

    return (
        <View className="flex-1 items-center justify-center gap-3 px-10">
            <Text className="text-white">Logout Screen</Text>
            <TouchableOpacity
                onPress={handleLogoutPress}
                className="text-black bg-white p-4 rounded"
            >
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    )
}
