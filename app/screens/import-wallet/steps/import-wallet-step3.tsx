import React, { useContext, useEffect, useRef } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Button, Text, AppScreen, Header } from "../../../components"
import { CONTAINER, NORMAL_TEXT, PRIMARY_BTN, PRIMARY_TEXT } from "../../../theme/elements"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { StepProps } from "../../../utils/MultiStepController/Step"
import { spacing } from "theme/spacing"
import { ScrollView } from "react-native-gesture-handler"
import readyIcon from "../../../../assets/svg/ready.svg"
import { SvgXml } from "react-native-svg"
import Confetti from "react-native-confetti"

export function ImportWalletStep3(props: StepProps) {
  // Pull in navigation via hook

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const CONTAINER_STYLE: ViewStyle = {
    ...CONTAINER,
    justifyContent: "center",
  }
  const headerStyle: ViewStyle = {
    justifyContent: "center",
    paddingHorizontal: spacing[0],
    width: "100%",
  }
  const headerTitleSTYLE: TextStyle = {
    ...headerStyle,
    fontSize: 27,
    lineHeight: 37,
    fontWeight: "700",
  }
  const CONTENT_STYLE: ViewStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
  const BUTTON_STYLE: ViewStyle = {
    ...PRIMARY_BTN,
    width: "85%",
    height: 62,
    borderRadius: 80,
    marginTop: spacing[6],
  }
  const ICON_STYLE: ViewStyle = {
    marginTop: spacing[5],
  }

  const confettiRef = useRef(null)

  useEffect(() => {
    confettiRef.current.startConfetti()
  }, [confettiRef])

  return (
    <AppScreen {...props}>
      <Confetti ref={confettiRef} />
      <ScrollView contentContainerStyle={CONTAINER_STYLE}>
        <View style={CONTENT_STYLE}>
          <Header
            headerText="Your wallet is ready"
            style={headerStyle}
            titleStyle={headerTitleSTYLE}
          />
          <Text style={[NORMAL_TEXT]}>
            The restoration of your wallet is successful. You are now ready to manage your assets.
          </Text>

          <SvgXml width={85} height={85} xml={readyIcon} style={ICON_STYLE} />

          <Button
            testID="next-screen-button"
            style={BUTTON_STYLE}
            textStyle={PRIMARY_TEXT}
            onPress={onButtonNext}
            text="LET'S GO!"
          />
        </View>
      </ScrollView>
    </AppScreen>
  )
}
