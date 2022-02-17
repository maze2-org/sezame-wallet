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
import { WalletCreateContext } from "../create-wallet-screen"
import { WalletGenerator } from "@maze2/sezame-sdk"

export function CreateWalletStep1(props: StepProps) {
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

    if (!seedPhrase) {
      const newMnemonic = WalletGenerator.generateMnemonic()
      setSeedPhrase(newMnemonic)
    }

    onButtonNext()
  }

  const {
    setWalletName,
    setWalletPassword,
    setSeedPhrase,
    walletName,
    walletPassword,
    seedPhrase,
  } = useContext(WalletCreateContext)

  return (
    <SafeAreaView {...props}>
      <Header headerTx="createWallet.newWallet" />
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

  // return (
  //   <>
  //     <Header headerTx="createWallet.newWallet" />
  //     <TextInput
  //       style={textInput}
  //       placeholder="Wallet name"
  //       placeholderTextColor={color.palette.white}
  //     />
  //     <TextInput
  //       style={textInput}
  //       placeholder="Password"
  //       placeholderTextColor={color.palette.white}
  //       textContentType="newPassword"
  //       secureTextEntry={true}
  //     />
  //     <TextInput
  //       style={textInput}
  //       placeholder="Confirm Password"
  //       placeholderTextColor={color.palette.white}
  //       textContentType="newPassword"
  //       secureTextEntry={true}
  //     />
  //     <View style={footBtn}>
  //       <Button preset="header" text="Cancel" onPress={onButtonBack} />
  //       <Button preset="header" text="Next" onPress={onButtonNext} />
  //     </View>
  //   </>
  // )
}
