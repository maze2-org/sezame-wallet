import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { AppScreen, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const NftsScreen: FC<StackScreenProps<NavigatorParamList, "nfts">> = observer(
  function NftsScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()
    return (
      <AppScreen unsafe>
        <View
          style={{
            display: "flex",
            flexGrow: 1,
            alignContent: "center",
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              textTransform: "uppercase",
              textAlignVertical: "center",
              fontSize: 22,
            }}
          >
            Coming soon!
          </Text>
        </View>
      </AppScreen>
    )
  },
)
