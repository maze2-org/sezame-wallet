import React, { useContext, useState } from "react"
import { View } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { Button, Header } from "../../../components"
import { btnDefault, btnDisabled, footBtn, textInput, demoText } from "../../../theme/elements"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { StepProps } from "../../../utils/MultiStepController/Step"
import { useForm, Controller } from "react-hook-form"
import { SafeAreaView } from "react-native-safe-area-context"
import { TextInputField } from "../../../components/text-input-field/text-input-field"
import { ImportWalletScreen, WalletImportContext } from "../import-wallet-screen"
import { WalletGenerator } from "@maze2/sezame-sdk"

export function ImportWalletStep2(props: StepProps) {
  // Pull in navigation via hook

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const onSubmit = (data) => {
    setSeedPhrase(data.seedPhrase)
    onButtonNext()
  }

  const { setSeedPhrase, seedPhrase } = useContext(WalletImportContext)

  console.log("seed ", seedPhrase)
  return (
    <SafeAreaView {...props}>
      <Header headerText="Import wallet" />

      <Controller
        control={control}
        defaultValue={seedPhrase}
        name="seedPhrase"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInputField
            name="seedPhrase"
            style={textInput}
            errors={errors}
            placeholder="Enter your wallet mnemonic"
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
          text="Import"
          textStyle={demoText}
          onPress={handleSubmit(onSubmit)}
          style={btnDefault}
        />
      </View>
    </SafeAreaView>
  )
}
