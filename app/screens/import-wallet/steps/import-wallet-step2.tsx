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
import { WalletImportContext } from "../import-wallet-screen"
import { StoredWallet } from "utils/stored-wallet"
import { StackNavigationProp } from "@react-navigation/stack"
import { NavigatorParamList } from "navigators/app-navigator"
import { useNavigation } from "@react-navigation/native"
import { defaultAssets } from "utils/consts"

export function ImportWalletStep2(props: StepProps) {
  // Pull in navigation via hook

  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const { seedPhrase, walletName, walletPassword } = useContext(WalletImportContext)
  const onSubmit = async (data) => {
    const storedWallet = new StoredWallet(walletName, data.seedPhrase, walletPassword)

    await storedWallet.addAssets(defaultAssets)

    await storedWallet.save()
    navigation.replace("chooseWallet")
  }

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
