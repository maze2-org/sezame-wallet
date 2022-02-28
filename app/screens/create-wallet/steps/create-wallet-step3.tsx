import React, { useContext } from "react"
import { View } from "react-native"
import { Button, Header, Text } from "../../../components"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  btnDefault,
  btnDisabled,
  demoText,
  footBtn,
  headerTitle,
  textInput,
  warning,
} from "../../../theme/elements"
import { StepProps } from "../../../utils/MultiStepController/Step"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { WalletCreateContext } from "../create-wallet-screen"
import { TextInputField } from "../../../components/text-input-field/text-input-field"

export function CreateWalletStep3(props: StepProps) {
  const { seedPhrase } = useContext(WalletCreateContext)
  const {
    control,
    formState: { errors },
  } = useForm({ mode: "onChange" })

  const pastedSeedPhrase = useWatch({
    control,
    name: "pastedSeedPhrase",
    defaultValue: "",
  })

  const isSeedPhraseCorrect = seedPhrase === pastedSeedPhrase

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  return (
    <>
      <Header headerText="Seed phrase verification" titleStyle={headerTitle} />
      <Text style={warning}>Let's verify that you properly store your seed phrase.</Text>
      <Text style={warning}>PLEASE WRITE YOUR SEED PHRASE BELOW</Text>

      <Controller
        control={control}
        name="pastedSeedPhrase"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInputField
            name="pastedSeedPhrase"
            style={textInput}
            errors={errors}
            placeholder="Enter your wallet name"
            value={value}
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
          />
        )}
        rules={{
          required: {
            value: true,
            message: "Field is required!",
          },
        }}
      />

      <View style={footBtn}>
        <Button
          preset="header"
          text="Back"
          style={btnDefault}
          textStyle={demoText}
          onPress={onButtonBack}
        />
        <Button
          preset="header"
          text="Finalize"
          textStyle={demoText}
          onPress={onButtonNext}
          style={[btnDefault, !isSeedPhraseCorrect && { ...btnDisabled }]}
          disabled={!isSeedPhraseCorrect}
        />
      </View>
    </>
  )
}
