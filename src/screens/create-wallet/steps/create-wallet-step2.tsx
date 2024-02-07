import React, { useContext, useState } from "react"
import { ImageStyle, SafeAreaView, TextStyle, View, ViewStyle } from "react-native"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { Button, Checkbox, Header, Text, AutoImage as Image, AppScreen } from "../../../components"
import {
  btnDisabled,
  CONTAINER,
  copyBtn,
  headerTitle,
  LABEL,
  NORMAL_TEXT,
  PRIMARY_BTN,
  PRIMARY_OUTLINE_BTN,
  PRIMARY_TEXT,
  SMALL_TEXT,
} from "../../../theme/elements"
import { StepProps } from "../../../utils/MultiStepController/Step"
import Clipboard from "@react-native-clipboard/clipboard"
import { showMessage } from "react-native-flash-message"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { WalletCreateContext } from "../create-wallet-screen"
import { color, spacing } from "theme"
import { useForm } from "react-hook-form"
import { SvgXml } from "react-native-svg"
import copyIcon from "@assets/icons/copy.svg"

// const copyIcon = require()
const READ_CONDITIONS_TEXT: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  marginVertical: spacing[4],
}
export function CreateWalletStep2(props: StepProps) {
  // style
  const headerStyle: ViewStyle = {
    justifyContent: "center",
    paddingHorizontal: spacing[0],
    width: "100%",
  }

  const TEXT_STYLE: TextStyle = {
    ...NORMAL_TEXT,
    paddingBottom: spacing[5],
  }
  const WARNING_STYLE: TextStyle = {
    ...TEXT_STYLE,
    color: color.palette.gold,
  }

  const IMPORTANT_STYLE: TextStyle = {
    ...TEXT_STYLE,
    color: color.palette.angry,
  }

  const buttonIconStyle: ImageStyle = {
    position: "absolute",
    right: 15,
  }

  const phaseStyle: TextStyle = {
    width: "100%",
    height: 150,
    backgroundColor: "#111111",
    display: "flex",
    flexDirection: "column",
    borderRadius: 10,
    marginTop: spacing[3],
  }
  const phaseBorder: TextStyle = {
    height: 2,
    backgroundColor: "#343434",
  }
  const cardBody: ViewStyle = {
    height: "70%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: spacing[4],
  }
  const bodyText: TextStyle = {
    fontSize: 15,
    lineHeight: 20,
  }
  const phaseFooter: ViewStyle = {
    display: "flex",
    flexDirection: "row",
    height: "30%",
    justifyContent: "center",
    alignItems: "center",
  }
  const footerText: TextStyle = {
    fontSize: 10,
    lineHeight: 14,
    color: color.palette.white,
    paddingLeft: spacing[2],
  }
  const { seedPhrase } = useContext(WalletCreateContext)

  const [condition1, setCondition1] = useState(false)
  const [condition2, setCondition2] = useState(false)
  const [condition3, setCondition3] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // const isValid = condition1 && condition2 && condition3

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const copyToClipboard = () => {
    if (seedPhrase) {
      Clipboard.setString(seedPhrase)
    }
    showMessage({
      message: "seed phrase copied to clipboard",
      type: "success",
    })
  }

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const onSubmit = (data) => {
    setSubmitted(true)
    if (condition1 && condition2 && condition3) {
      onButtonNext()
    }
  }

  const nextIcon = require("@assets/icons/next.png")

  return (
    <AppScreen {...props}>
      <ScrollView contentContainerStyle={CONTAINER}>
        <View>
          <Header
            headerText="Keep your seed phrase safe"
            style={headerStyle}
            titleStyle={headerTitle}
          />
          <Text style={TEXT_STYLE}>
            A seed phrase is the only way for you to keep access on your assets even if your device
            is destroyed or stolen. You will be the only owner of this need and nobody else will
            keep it for you.
          </Text>
          <Text style={IMPORTANT_STYLE}>
            SAVE THE FOLLOWING SEED PHRASE IN SEVERAL AND SAFE LOCATIONS
          </Text>
        </View>
        <View>
          <View style={phaseStyle}>
            <View style={cardBody}>
              <Text style={bodyText}>{seedPhrase}</Text>
            </View>
            <View style={phaseBorder}></View>
            <View style={phaseFooter}>
              <TouchableOpacity style={copyBtn} onPress={copyToClipboard}>
                <SvgXml width={20} height={20} xml={copyIcon} />
              </TouchableOpacity>
              <Text style={footerText}>COPY PHRASE</Text>
            </View>
          </View>
        </View>
        <Text style={READ_CONDITIONS_TEXT}>
          Please accept the following conditions to continue.
        </Text>
        <SafeAreaView>
          <Checkbox
            text="I have written my seed phrase in a safe location."
            value={condition1}
            multiline={true}
            onToggle={() => setCondition1(!condition1)}
            style={{ paddingRight: spacing[3] }}
            errors={submitted && !condition1 && ["Required field"]}
          />
          <Checkbox
            text="I will never share my seed phrase to anybody."
            value={condition2}
            multiline={true}
            onToggle={() => setCondition2(!condition2)}
            style={{ paddingRight: spacing[1] }}
            errors={submitted && !condition2 && ["Required field"]}
          />
          <Checkbox
            text="If I loose my seed, I will lose access to my assets."
            value={condition3}
            multiline={true}
            onToggle={() => setCondition3(!condition3)}
            style={{ paddingRight: spacing[2], marginBottom: spacing[4] }}
            errors={submitted && !condition3 && ["Required field"]}
          />
          <Button
            testID="next-screen-button"
            style={[PRIMARY_BTN, (!condition1 || !condition2 || !condition3) && { ...btnDisabled }]}
            textStyle={PRIMARY_TEXT}
            onPress={handleSubmit(onSubmit)}
            disabled={!condition1 || !condition2 || !condition3}
          >
            <Text tx="createWallet.next" />
            <Image source={nextIcon} style={buttonIconStyle} />
          </Button>
          <Button
            testID="next-screen-button"
            style={PRIMARY_OUTLINE_BTN}
            textStyle={PRIMARY_TEXT}
            tx="common.back"
            onPress={onButtonBack}
          />
        </SafeAreaView>
      </ScrollView>
    </AppScreen>
  )
}
