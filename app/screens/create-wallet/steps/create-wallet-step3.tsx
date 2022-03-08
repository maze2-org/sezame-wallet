import React, { useContext, useState } from "react"
import { View } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Button, Header, Text } from "../../../components"
import IonicIcon from "react-native-vector-icons/FontAwesome5"
import {
  btnDefault,
  btnDisabled,
  checkbox,
  checkboxContainer,
  conditionsCheckbox,
  copyBtn,
  demoText,
  footBtn,
  headerTitle,
  label,
  mnemonicContainer,
  mnemonicStyle,
  warning,
} from "../../../theme/elements"
import { StepProps } from "../../../utils/MultiStepController/Step"
import Clipboard from "@react-native-clipboard/clipboard"
import { showMessage } from "react-native-flash-message"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { WalletCreateContext } from "../create-wallet-screen"

export function CreateWalletStep3(props: StepProps) {
  const { seedPhrase } = useContext(WalletCreateContext)

  const [condition1, setCondition1] = useState(false)
  const [condition2, setCondition2] = useState(false)
  const [condition3, setCondition3] = useState(false)

  const isValid = condition1 && condition2 && condition3

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

  return (
    <>
      <Header headerText="Save your seed phrase" titleStyle={headerTitle} />
      <Text style={warning}>
        We generated this unique seed phrase for you. Please copy this seed to multi safe location.
      </Text>
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
      </View>
      <View style={footBtn}>
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
      </View>
    </>
  )
}
