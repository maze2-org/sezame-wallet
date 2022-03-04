import React, { FC } from "react"
import { View, ViewStyle, TextStyle, ImageStyle, SafeAreaView } from "react-native"
import { StackScreenProps } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import {
  Button,
  Header,
  Screen,
  Text,
  GradientBackground,
  AutoImage as Image,
} from "../../components"
import { color, spacing, typography } from "../../theme"
import { NavigatorParamList } from "../../navigators"
import { RootPageStyle } from "../../theme/elements"

const sesameLogo = require("../../../assets/images/Logo.png");

const CONTAINER: ViewStyle = {
  backgroundColor: "#23282C",
  paddingHorizontal: spacing[6],
  paddingTop: spacing[5],
  height: "100%",
  display: "flex",
  justifyContent: "space-between"
}
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
  fontSize: 12
}
const BOLD: TextStyle = { fontWeight: "bold" }

const SESAMELOGO: ImageStyle = {
  alignSelf: "center",
  marginVertical: spacing[5],
  maxWidth: "100%",
  width: 247,
  height: 51,
}
const PRIMARY_BTN: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: color.palette.gold,
  width: 237,
  height: 74,
  borderRadius: 80
}
const PRIMARY_OUTLINE_BTN: ViewStyle = {
  ...PRIMARY_BTN,
  backgroundColor: color.transparent,
  borderWidth: 1,
  borderColor: color.palette.gold
}
const BUTTON_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 15,
  lineHeight: 20,
  textTransform: "uppercase"
}
const BUTTON_OUTLINE_TEXT: TextStyle = {
  ...BUTTON_TEXT,
  color: color.palette.gold
}
const FOOTER: ViewStyle = { backgroundColor: "transparent", marginTop: spacing[0], marginVertical: 0, marginHorizontal: "auto", alignItems: "center" }
const FOOTER_CONTENT: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
}

const DIVIDER_CONTENT: ViewStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  width: '100%',
  paddingTop: spacing[2],
  paddingBottom: spacing[2],
  
}

const DIVIDER: ViewStyle = {
  width: '28%',
  height: 1,
  backgroundColor: color.palette.gold,
  marginLeft: spacing[4],
  marginRight: spacing[4],
}

const FOOTER_TEXT: TextStyle = {
  ...TEXT,
  lineHeight: 16.5,
  width: 265,
  display: "flex",
  textAlign: "center"
}

export const WelcomeScreen: FC<StackScreenProps<NavigatorParamList, "welcome">> = observer(
  ({ navigation }) => {
    return (
      <View testID="WelcomeScreen" style={RootPageStyle}>
        <Screen style={CONTAINER}>
          <Image source={sesameLogo} style={SESAMELOGO} />
          <SafeAreaView style={FOOTER}>
            <View style={FOOTER_CONTENT}>
              <Button
                testID="next-screen-button"
                style={PRIMARY_BTN}
                textStyle={BUTTON_TEXT}
                tx="welcomeScreen.create"
                onPress={() => {
                  console.log("CREATE A WALLET")
                  navigation.navigate("createWallet")
                }}
              />
            </View>
            <View style={DIVIDER_CONTENT}>
              <View style={DIVIDER}>
                
              </View>
              <Text style={TEXT}> OR </Text>
              <View style={DIVIDER}>
                
              </View>
            </View>
            <View style={FOOTER_CONTENT}>
              <Button
                testID="next-screen-button"
                style={PRIMARY_OUTLINE_BTN}
                textStyle={BUTTON_OUTLINE_TEXT}
                tx="welcomeScreen.restore"
                onPress={() => navigation.navigate("importWallet")}
              />
            </View>
          </SafeAreaView>
          <View style={FOOTER_CONTENT}>
            <Text style={FOOTER_TEXT}>
            Seems like this is the first time you use Sezame Wallet. You have to create or restore a wallet before you can use this application.
            </Text>
          </View>
        </Screen>
      </View>
    )
  },
)
