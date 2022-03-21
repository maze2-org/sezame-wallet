import React, { useContext, useState } from "react"
import { TextStyle, ImageStyle } from "react-native"
import { Button, AutoImage as Image, Text, Checkbox, AppScreen } from "../../../components"
import {
  btnDisabled,
  CONTAINER,
  LogoStyle,
  PRIMARY_BTN,
  PRIMARY_OUTLINE_BTN,
  PRIMARY_TEXT,
  SesameLogo,
  textInput,
} from "../../../theme/elements"
import { StepsContext } from "../../../utils/MultiStepController/MultiStepController"
import { StepProps } from "../../../utils/MultiStepController/Step"
import { useForm, Controller, useWatch } from "react-hook-form"
import { SafeAreaView } from "react-native-safe-area-context"
import { WalletCreateContext } from "../create-wallet-screen"
import { WalletGenerator } from "@maze2/sezame-sdk"
import { spacing } from "theme/spacing"
import { ScrollView } from "react-native-gesture-handler"
import { TextInputField } from "components/text-input-field/text-input-field"

export function CreateWalletStep1(props: StepProps) {
  // Pull in navigation via hook

  const nextIcon = require("../../../../assets/icons/next.png")

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const password = useWatch({
    control,
    name: "walletPassword",
    defaultValue: "",
  })

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

  const [condition1, setCondition1] = useState(false)

  const TEXT_STYLE: TextStyle = {
    fontSize: 12,
    lineHeight: 16.34,
    paddingTop: spacing[5],
  }

  const buttonIconStyle: ImageStyle = {
    position: "absolute",
    right: 15,
  }

  return (
    <AppScreen {...props}>
      <ScrollView contentContainerStyle={CONTAINER}>
        <SafeAreaView>
          <Image source={SesameLogo} style={LogoStyle} />
          <Text
            style={TEXT_STYLE}
            text="Your wallet needs to be secured on this mobile phone. Choose a name and a password that will be used to encrypt your wallet information."
          />
        </SafeAreaView>

        <SafeAreaView>
          <Controller
            control={control}
            defaultValue={walletName}
            name="walletName"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInputField
                name="walletName"
                style={textInput}
                errors={errors}
                label="Wallet Name"
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
                label="Choose a password"
                secureTextEntry={true}
                name="walletPassword"
                style={textInput}
                errors={errors}
                value={value}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
                {...register("walletPassword", {
                  required: "You must specify a password",
                  minLength: {
                    value: 8,
                    message: "Password must have at least 8 characters",
                  },
                })}
              />
            )}
          />
          <Controller
            control={control}
            defaultValue={walletPassword}
            name="walletConfirmPassword"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInputField
                label="Confirm password"
                secureTextEntry={true}
                name="walletConfirmPassword"
                style={textInput}
                errors={errors}
                value={value}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
                {...register("walletConfirmPassword", {
                  validate: (value) => value === password || "The passwords do not match",
                })}
              />
            )}
            rules={{
              required: {
                value: true,
                message: "Field is required!",
              },
            }}
          />
        </SafeAreaView>
        <SafeAreaView>
          <Checkbox
            text="By creating a wallet, I accept the terms and policies"
            value={condition1}
            multiline={true}
            onToggle={() => setCondition1(!condition1)}
            style={{ paddingHorizontal: spacing[2], marginBottom: spacing[6] }}
          />
          <Button
            testID="next-screen-button"
            style={[PRIMARY_BTN, !condition1 && {...btnDisabled}, !isValid && { ...btnDisabled }]}
            textStyle={PRIMARY_TEXT}
            onPress={handleSubmit(onSubmit)}
            disabled={!condition1}
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
      </ScrollView>
    </AppScreen>
  )
}
