import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, Image, View } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { useStores } from "models"
import QRCode from "react-native-qrcode-svg"

import { NavigatorParamList } from "../../navigators"
import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { color } from "theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const QR_CONTAINER: ViewStyle = {
  display: "flex",
  alignItems: "center",
  alignContent: "center",
}
export const ReceiveScreen: FC<StackScreenProps<NavigatorParamList, "receive">> = observer(
  function ReceiveScreen({ route }) {
    const { currentWalletStore } = useStores()
    const { getAssetById } = currentWalletStore
    const asset = getAssetById(route.params.coinId)

    return (
      <Screen style={ROOT} preset="scroll">
        <Text preset="header" text="receive" />
        <View style={QR_CONTAINER}>
          <QRCode value={asset.address} size={250} />
        </View>
      </Screen>
    )
  },
)
