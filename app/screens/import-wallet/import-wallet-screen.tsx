import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import PagerView from "react-native-pager-view"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  padding: spacing[2],
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

const FOOT_BTN: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}

const PAGER: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing[4],
}
export const ImportWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "importWallet">
> = observer(function ImportWalletScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const refPagerView = React.useRef<PagerView>(null)

  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const goToDashboard = () => navigation.navigate("dashboard")
  const goToWelcome = () => navigation.navigate("welcome")
  const next = () => refPagerView.current?.setPage(1)
  return (
    <Screen style={ROOT} preset="scroll">
      <PagerView ref={refPagerView} initialPage={0} style={PAGER}>
        <View key="1">
          <Header headerTx="importWallet.importWallet" titleStyle={HEADER_TITLE} />

          <TextInput
            style={TEXT_INPUT}
            placeholder="Wallet name"
            placeholderTextColor={color.palette.white}
          />

          <TextInput
            style={TEXT_INPUT}
            placeholder="Password"
            placeholderTextColor={color.palette.white}
            textContentType="newPassword"
            secureTextEntry={true}
          />

          <View style={FOOT_BTN}>
            <Button
              preset="header"
              text="Cancel"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
              onPress={goToWelcome}
            />
            <Button
              onPress={next}
              preset="header"
              text="Next"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
            />
          </View>
        </View>
        <View key="2">
          <Header headerText="Provide your seed phrase" titleStyle={HEADER_TITLE} />
          <TextInput
            style={TEXT_INPUT}
            placeholder="Mnemonic"
            placeholderTextColor={color.palette.white}
            textContentType="newPassword"
            numberOfLines={4}
          />
          <View style={FOOT_BTN}>
            <Button
              preset="header"
              text="Cancel"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
              onPress={goToWelcome}
            />
            <Button
              preset="header"
              text="Next"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
              onPress={goToDashboard}
            />
          </View>
        </View>
      </PagerView>
    </Screen>
  )
})
