import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextInput, TextStyle, View, ViewStyle, StyleSheet } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import PagerView from "react-native-pager-view"
// import { WalletGenerator } from "@maze2/sezame-sdk"
import { NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { WalletGenerator } from "@coingrig/core"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  padding: spacing[5],
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

const FOOT_BTN: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}

const CONDITIONS_CHECKBOX: ViewStyle = {}

const CHECKBOX_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  padding: spacing[2],
  marginHorizontal: spacing[4],
}
const LABEL: TextStyle = {
  fontSize: 14,
}
const CHECKBOX: ViewStyle = {}
const PAGER: ViewStyle = {
  flex: 1,
}

const MNEMONIC_CONTAINER: ViewStyle = {}
const MNEMONIC: TextStyle = {}
export const CreateWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "createWallet">
> = observer(function CreateWalletScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const refPagerView = React.useRef<PagerView>(null)

  const [currentView, setCurrentView] = useState(0)
  const [condition1, setCondition1] = useState(false)
  const [condition2, setCondition2] = useState(true)
  const [condition3, setCondition3] = useState(false)

  const [mnemonic, setMnemonic] = useState("")
  const createWallet = async () => {
    const newMnemonic =  WalletGenerator.generateMnemonic()
    setMnemonic(newMnemonic)
  }
  // Pull in navigation via hook
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const goToDashboard = () => navigation.navigate("dashboard")
  const next = () => {
    console.log("next ", condition1, condition2, condition3)

    refPagerView.current?.setPage(1)
  }
  return (
    <Screen style={ROOT} preset="scroll">
      <PagerView ref={refPagerView} initialPage={0} style={PAGER}>
        <View key="1">
          <Header headerTx="createWallet.newWallet" titleStyle={HEADER_TITLE} />
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
          <TextInput
            style={TEXT_INPUT}
            placeholder="Confirm Password"
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
              onPress={goToDashboard}
            />
            <Button
              preset="header"
              text="Next"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
              onPress={next}
            />
          </View>
        </View>
        <View key="2">
          <Header headerTx="createWallet.newWallet" titleStyle={HEADER_TITLE} />
          <View style={MNEMONIC_CONTAINER}>
            <Text style={MNEMONIC}>{mnemonic}</Text>
          </View>
          <View style={CONDITIONS_CHECKBOX}>
            <View style={CHECKBOX_CONTAINER}>
              <BouncyCheckbox
                isChecked={condition1}
                onPress={() => setCondition1(!condition1)}
                style={CHECKBOX}
              />
              <Text style={LABEL}>I have written my seed in a safe location.</Text>
            </View>
            <View style={CHECKBOX_CONTAINER}>
              <BouncyCheckbox
                isChecked={condition2}
                onPress={() => setCondition2(!condition2)}
                style={CHECKBOX}
              />
              <Text style={LABEL}>I'm aware to never share my seed phrase to anybody.</Text>
            </View>
            <View style={CHECKBOX_CONTAINER}>
              <BouncyCheckbox
                isChecked={condition3}
                onPress={() => setCondition3(!condition3)}
                style={CHECKBOX}
              />
              <Text style={LABEL}>
                I'm aware if I loose my seed, I may lose access to my funds.
              </Text>
            </View>
          </View>
          <View style={FOOT_BTN}>
            <Button
              preset="header"
              text="Cancel"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
              onPress={goToDashboard}
            />
            <Button
              preset="header"
              text="Next"
              style={CREATE_BTN}
              textStyle={DEMO_TEXT}
              onPress={next}
            />
          </View>
        </View>
      </PagerView>
    </Screen>
  )
})
