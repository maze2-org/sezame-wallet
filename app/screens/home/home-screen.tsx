import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import IonicIcon from "react-native-vector-icons/Ionicons"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const TITLE: TextStyle = {
  textAlign: "center",
  alignItems: "center",
}

export const HomeScreen: FC<StackScreenProps<NavigatorParamList, "home">> = observer(
  function HomeScreen() {
    // Pull in navigation via hook
    const navigation = useNavigation()

    return (
      <Screen style={ROOT} preset="scroll">
        <Text preset="header" style={TITLE} text="Home" />
      </Screen>
    )
  },
)
