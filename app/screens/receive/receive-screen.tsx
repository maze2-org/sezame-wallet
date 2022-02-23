import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, Image } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { useStores } from "models"
import CodeGenerator from "react-native-smart-code"
import { NavigatorParamList } from "../../navigators"
import { Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
import { color } from "theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const ReceiveScreen: FC<StackScreenProps<NavigatorParamList, "receive">> = observer(
  function ReceiveScreen({ route }) {
    const { currentWalletStore } = useStores()
    const { getAssetById } = currentWalletStore
    const asset = getAssetById(route.params.coinId)
    const [imageUri, setImageUri] = useState<any>(null)
    useEffect(() => {
      console.log("smart code generator ", CodeGenerator)
      // CodeGenerator.generate({
      //   type: CodeGenerator.Type.QRCode,
      //   code: asset.address,
      // })
      //   .then((response) => {
      //     setImageUri(response)
      //   })
      //   .catch((err) => console.log("Error creating QR code", err))
    }, [asset.address])

    // Pull in navigation via hook
    // const navigation = useNavigation()
    return (
      <Screen style={ROOT} preset="scroll">
        <Text preset="header" text="receive" />
        <Image source={{ uri: imageUri }} resizeMode="stretch" />
      </Screen>
    )
  },
)
