import { View, Text } from "react-native"
import { AppVersion as version } from "~/constants/version"

const AppVersion: React.FC = () => {
   return (
      <View className="mt-8 mb-6">
         <Text className="text-gray-500 text-center text-sm">
            App Version {version}
         </Text>
      </View>
   )
}

export default AppVersion
