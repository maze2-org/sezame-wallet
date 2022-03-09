import React, { useContext, useEffect, useRef, useState } from "react"
import { ImageStyle, SafeAreaView, View, ViewStyle } from "react-native"
import { Button, Header, Text, AutoImage as Image, TextField } from "components"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  btnDefault,
  btnDisabled,
  CONTAINER,
  demoText,
  footBtn,
  headerTitle,
  NORMAL_TEXT,
  PRIMARY_BTN,
  PRIMARY_OUTLINE_BTN,
  PRIMARY_TEXT,
  textInput,
  warning,
} from "theme/elements"
import { StepProps } from "utils/MultiStepController/Step"
import { StepsContext } from "utils/MultiStepController/MultiStepController"
import { WalletCreateContext } from "../create-wallet-screen"
import { TextInputField } from "components/text-input-field/text-input-field"
import { spacing } from "theme"
import { bip39Words } from "../../../utils/bip39Words"
export function CreateWalletStep3(props: StepProps) {
  const nextIcon = require("../../../../assets/icons/next.png")
  const { seedPhrase } = useContext(WalletCreateContext)
  const {
    control,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" })

  const pastedSeedPhrase = useWatch({
    control,
    name: "pastedSeedPhrase",
    defaultValue: "",
  })

  const isSeedPhraseCorrect = seedPhrase === pastedSeedPhrase
  console.log({ isSeedPhraseCorrect, seedPhrase, pastedSeedPhrase })
  const { onButtonBack, onButtonNext } = useContext(StepsContext)
  const [words, setWords] = useState([])
  const [usedWords, setUsedWords] = useState([])
  const [isValid, setIsValid] = useState(true)
  useEffect(() => {
    const words = seedPhrase.split(" ")
    setWords(words)
  }, [seedPhrase])

  const headerStyle: ViewStyle = {
    justifyContent: "center",
    paddingHorizontal: spacing[0],
    width: "100%",
  }
  const buttonIconStyle: ImageStyle = {
    position: "absolute",
    right: 15,
  }
  const whitelistContainerStyle: ViewStyle = {
    display: "flex",
    paddingVertical: spacing[2],
    flexDirection: "row",
    flexWrap: "wrap",
  }
  const whitelistItemStyle: ViewStyle = {
    height: 24,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    margin: spacing[1],
  }

  const renderRemainingWords = () => {
    return words
      .filter((w) => !usedWords.includes(w))
      .map((w, index) => (
        <View
          key={w}
          style={whitelistItemStyle}
          onStartShouldSetResponder={() => {
            usedWords.push(w)
            setUsedWords(usedWords)
            let phrase = pastedSeedPhrase
            phrase = phrase + " " + w
            phrase = phrase.trim()
            setValue("pastedSeedPhrase", phrase)
            return true
          }}
        >
          <Text text={w} style={NORMAL_TEXT} />
        </View>
      ))
  }
  return (
    <SafeAreaView {...props}>
      <View style={CONTAINER}>
        <View>
          <Header
            headerText="Provide your seed phrase"
            style={headerStyle}
            titleStyle={headerTitle}
          />
          <Text style={NORMAL_TEXT}>
            In order to recover your wallet, you must provide your seed phrase.
          </Text>
        </View>
        {/* <View>
          <TextField
            label="Seed phase"
            multiline={true}
            value={selectedWords.join(" ")}
            editable={false}
          />
          <TextField
            label="Next word"
            value={keyword}
            secureTextEntry={true}
            onChangeText={(value) => {
              onKeyChange(value)
            }}
          />
          <View style={whitelistContainerStyle}>{renderRemainingWords()}</View>
        </View> */}

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

        <View style={whitelistContainerStyle}>{renderRemainingWords()}</View>

        <SafeAreaView>
          <Button
            testID="next-screen-button"
            style={[PRIMARY_BTN, !isSeedPhraseCorrect && { ...btnDisabled }]}
            textStyle={PRIMARY_TEXT}
            onPress={onButtonNext}
            disabled={!isSeedPhraseCorrect}
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
    </SafeAreaView>
  )
}
