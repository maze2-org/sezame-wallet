import React, { useContext, useState } from "react"
import { View } from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { Button, Header } from "../../../components"
import { btnDefault, btnDisabled, footBtn, textInput } from "../../../theme/elements"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { StepProps } from "../../../utils/MultiStepController/Step"
import { useForm, Controller } from "react-hook-form"
import { SafeAreaView } from "react-native-safe-area-context"
import { TextInputField } from "../../../components/text-input-field/text-input-field"
import { ImportWalletScreen, WalletImportContext } from "../import-wallet-screen"
import { WalletGenerator } from "@maze2/sezame-sdk"

export function ImportWalletStep1(props: StepProps) {
  // Pull in navigation via hook

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const onSubmit = (data) => {
    setWalletName(data.walletName)
    setWalletPassword(data.walletPassword)

    onButtonNext()
  }

  const { setWalletName, setWalletPassword, walletName, walletPassword } = useContext(
    WalletImportContext,
  )

  return (
    <SafeAreaView {...props}>
      <Header headerText="Import wallet" />
      <Controller
        control={control}
        defaultValue={walletName}
        name="walletName"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInputField
            name="walletName"
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

      <Controller
        control={control}
        defaultValue={walletPassword}
        name="walletPassword"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInputField
            secureTextEntry={true}
            name="walletPassword"
            style={textInput}
            errors={errors}
            placeholder="Enter your wallet passord"
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
        <Button style={btnDefault} preset="header" text="Cancel" onPress={onButtonBack} />
        <Button
          style={[btnDefault, !isValid && { ...btnDisabled }]}
          disabled={!isValid}
          text="Continue"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </SafeAreaView>
  )
}
