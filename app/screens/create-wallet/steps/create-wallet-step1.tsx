import React, { useContext, useState } from "react"
import { TextStyle, View, ImageStyle } from "react-native"
import { Button, AutoImage as Image, Text, TextField, Checkbox } from "../../../components"
import {
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
import { useForm, Controller } from "react-hook-form"
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

  const eyeIcon = require("../../../assets/icons/eye.png")
  return (
    <ScrollView>
      <SafeAreaView {...props}>
        <View style={CONTAINER}>
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
                  placeholder="Enter your wallet password"
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

          {/* <SafeAreaView>
            <TextField label="Wallet Name" />
            <TextField label="Choose a password" secureTextEntry={true} icon={eyeIcon} />
            <TextField label="Confirm password" secureTextEntry={true} icon={eyeIcon} />
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
              style={PRIMARY_BTN}
              textStyle={PRIMARY_TEXT}
              onPress={onButtonNext}
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
          </SafeAreaView> */}
        </View>
        {/* <Header headerTx="createWallet.newWallet" />
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
            placeholder="Enter your wallet password"
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
      </View> */}
      </SafeAreaView>
    </ScrollView>
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
