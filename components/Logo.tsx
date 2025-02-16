import React from "react"
import { View, Text } from "react-native"
import { Scissors } from "lucide-react-native"

interface LogoProps {
   className?: string
}

const Logo: React.FC<LogoProps> = ({ className }) => (
   <View className={`flex-row items-center space-x-2 ${className} text-6xl`}>
      <Scissors className="w-12 h-12 text-white" color={"white"} />
      <Text className="text-5xl font-bold text-white">
         <Text className="text-purple-500 text-md">C</Text>
         <Text className="text-white">clip</Text>
      </Text>
   </View>
)

export default Logo
