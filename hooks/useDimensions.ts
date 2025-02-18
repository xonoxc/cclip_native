import { Dimensions } from "react-native"

export function useScreenDimensions() {
   const { height, width } = Dimensions.get("window")
}
