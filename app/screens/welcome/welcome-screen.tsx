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

const sesameLogo = require("./sesame.png")

const CONTAINER: ViewStyle = {
  backgroundColor: "#161619",
  paddingHorizontal: spacing[4],
  paddingTop: spacing[4],
  height: "100%",
}
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}
const BOLD: TextStyle = { fontWeight: "bold" }

const SESAMELOGO: ImageStyle = {
  alignSelf: "center",
  marginVertical: spacing[5],
  maxWidth: "100%",
  width: 343,
  height: 230,
}
const CONTINUE: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: color.palette.deepPurple,
}
const CONTINUE_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 15,
  letterSpacing: 2,
}
const FOOTER: ViewStyle = { backgroundColor: "transparent", marginTop: spacing[5] }
const FOOTER_CONTENT: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
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
                style={CONTINUE}
                textStyle={CONTINUE_TEXT}
                tx="welcomeScreen.create"
                onPress={() => {
                  console.log("CREATE A WALLET")
                  navigation.navigate("createWallet")
                }}
              />
            </View>
            <View style={FOOTER_CONTENT}>
              <Button
                testID="next-screen-button"
                style={CONTINUE}
                textStyle={CONTINUE_TEXT}
                tx="welcomeScreen.restore"
                onPress={() => navigation.navigate("importWallet")}
              />
            </View>
          </SafeAreaView>
        </Screen>
      </View>
    )
  },
)
