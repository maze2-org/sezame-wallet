import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { TextInput, TextStyle, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const TEXT_INPUT: TextStyle = {
  color: color.palette.white,
  borderColor: color.palette.white,
  borderWidth: 1,
  borderRadius: 4,
  padding: spacing[2],
  margin: spacing[4],
}
const BOLD: TextStyle = { fontWeight: "bold" }
const HEADER_TITLE: TextStyle = {
  ...BOLD,
  fontSize: 18,
  lineHeight: 15,
  textAlign: "center",
  letterSpacing: 1.5,
}
const CREATE_BTN: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: color.palette.deepPurple,
  margin: spacing[4],
}
const DEMO_TEXT: TextStyle = {
  ...BOLD,
  fontSize: 13,
  letterSpacing: 2,
}
export const ImportWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "importWallet">
> = observer(function ImportWalletScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const goToDashboard = () => navigation.navigate("dashboard")

  return (
    <Screen style={ROOT} preset="scroll">
      <Header headerTx="importWallet.importWallet" titleStyle={HEADER_TITLE} />

      <TextInput
        style={TEXT_INPUT}
        placeholder="Password"
        placeholderTextColor={color.palette.white}
        textContentType="newPassword"
        secureTextEntry={true}
      />
      <TextInput
        style={TEXT_INPUT}
        placeholder="Mnemonic"
        placeholderTextColor={color.palette.white}
        textContentType="newPassword"
        numberOfLines={4}
      />
      <Button
        preset="header"
        tx="importWallet.import"
        style={CREATE_BTN}
        textStyle={DEMO_TEXT}
        onPress={goToDashboard}
      />
    </Screen>
  )
})
