import React, { useContext, useState } from "react"
import { ImageStyle, SafeAreaView, TextStyle, View, ViewStyle } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Button, Checkbox, Header, Text, AutoImage as Image } from "../../../components"
import {
  CONTAINER,
  copyBtn,
  headerTitle,
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
import copyIcon from "../../../../assets/icons/copy.svg"

// const copyIcon = require()

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

  // const isValid = condition1 && condition2 && condition3

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const copyToClipboard = () => {
    if (seedPhrase) {
      Clipboard.setString(seedPhrase)
    }
    showMessage({
      message: "mnemonic copied to clipboard",
      type: "success",
    })
  }

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const onSubmit = (data) => {
    onButtonNext()
  }

  const nextIcon = require("../../../../assets/icons/next.png")

  return (
    <SafeAreaView {...props}>
      <View style={CONTAINER}>
        <View>
          <Header headerText="Save your seed phrase" style={headerStyle} titleStyle={headerTitle} />
          <Text style={TEXT_STYLE}>
            We generated this unique seed phrase for you. Please copy this seed to multi safe
            location.
          </Text>
          <Text style={WARNING_STYLE}>
            IF YOU LOSE THIS, YOU WILL LOSE THE ACCESS TO YOUR FUNDS.
          </Text>
        </View>
        <View>
          <Text style={SMALL_TEXT}>SEED PHRASE</Text>
          <View style={phaseStyle}>
            <View style={cardBody}>
              <Text style={bodyText}>{seedPhrase}</Text>
            </View>
            <View style={phaseBorder}></View>
            <View style={phaseFooter}>
              <TouchableOpacity style={copyBtn} onPress={copyToClipboard}>
                <SvgXml width="20" height="20" xml={copyIcon} />
              </TouchableOpacity>
              <Text style={footerText}>COPY PHRASE</Text>
            </View>
          </View>
        </View>
        <SafeAreaView>
          <Checkbox
            text="I have written my seed in a safe location."
            value={condition1}
            multiline={true}
            onToggle={() => setCondition1(!condition1)}
            style={{ paddingRight: spacing[3] }}
          />
          <Checkbox
            text="I'm aware to never share my seed phrase to anybody."
            value={condition2}
            multiline={true}
            onToggle={() => setCondition2(!condition2)}
            style={{ paddingRight: spacing[1] }}
          />
          <Checkbox
            text="I'm aware if I loose my seed, I may lose access to my funds."
            value={condition3}
            multiline={true}
            onToggle={() => setCondition3(!condition3)}
            style={{ paddingRight: spacing[2], marginBottom: spacing[4] }}
          />
          <Button
            testID="next-screen-button"
            style={PRIMARY_BTN}
            textStyle={PRIMARY_TEXT}
            onPress={handleSubmit(onSubmit)}
          >
            <Text tx="createWallet.next" />
            <Image source={nextIcon} style={buttonIconStyle} />
          </Button>
          <Button
            testID="next-screen-button"
            style={PRIMARY_OUTLINE_BTN}
            textStyle={PRIMARY_TEXT}
            tx="createWallet.cancel"
            onPress={onButtonBack}
          />
        </SafeAreaView>
      </View>
      {/*       
      
      <Text style={warning}>IF YOU LOSE THIS SEED YOU WILL LOSE THE ACCESS TO YOUR FUNDS</Text>
      <View style={mnemonicContainer}>
        <Text style={mnemonicStyle}>{seedPhrase}</Text>
        <TouchableOpacity style={copyBtn} onPress={copyToClipboard}>
          <IonicIcon name="clipboard-check" size={23} color={"#F9F7F1"} />
        </TouchableOpacity>
      </View>
      <View style={conditionsCheckbox}>
        <View style={checkboxContainer}>
          <BouncyCheckbox
            isChecked={condition1}
            onPress={() => setCondition1(!condition1)}
            style={checkbox}
          />
          <Text style={label}>I have written my seed in a safe location.</Text>
        </View>
        <View style={checkboxContainer}>
          <BouncyCheckbox
            isChecked={condition2}
            onPress={() => setCondition2(!condition2)}
            style={checkbox}
          />
          <Text style={label}>I'm aware to never share my seed phrase to anybody.</Text>
        </View>
        <View style={checkboxContainer}>
          <BouncyCheckbox
            isChecked={condition3}
            onPress={() => setCondition3(!condition3)}
            style={checkbox}
          />
          <Text style={label}>I'm aware if I loose my seed, I may lose access to my funds.</Text>
        </View>
      </View> */}

      {/* <View style={footBtn}>
        <Button
          preset="header"
          text="Cancel"
          style={btnDefault}
          textStyle={demoText}
          onPress={onButtonBack}
        />
        <Button
          preset="header"
          text="Next"
          textStyle={demoText}
          onPress={onButtonNext}
          style={[btnDefault, !isValid && { ...btnDisabled }]}
          disabled={!isValid}
        />
      </View> */}
    </SafeAreaView>
  )
}
