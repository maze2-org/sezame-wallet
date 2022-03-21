import React, { useContext, useEffect, useRef, useState } from "react"
import { ImageStyle, SafeAreaView, View, ViewStyle } from "react-native"
import { Button, Header, Text, AutoImage as Image, TextField, AppScreen } from "components"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  btnDisabled,
  CONTAINER,
  containerGrowable,
  headerTitle,
  NORMAL_TEXT,
  PRIMARY_BTN,
  PRIMARY_OUTLINE_BTN,
  PRIMARY_TEXT,
  textInput,
} from "theme/elements"
import { StepProps } from "utils/MultiStepController/Step"
import { StepsContext } from "utils/MultiStepController/MultiStepController"
import { WalletCreateContext } from "../create-wallet-screen"
import { TextInputField } from "components/text-input-field/text-input-field"
import { spacing } from "theme"
import { ScrollView } from "react-native-gesture-handler"
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

  const shuffle = (array) => {
    let currentIndex = array.length
    let randomIndex

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }

  useEffect(() => {
    const words = shuffle(seedPhrase.split(" "))
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
    paddingHorizontal: spacing[0],
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
    <AppScreen>
      <ScrollView contentContainerStyle={CONTAINER}>
        <View>
          <Header
            headerText="Confirm your seed phrase"
            style={headerStyle}
            titleStyle={headerTitle}
          />
          <Text style={NORMAL_TEXT}>
            Please select the words in the right order to confirm that your seed phrase is safe.
          </Text>
        </View>
        <View style={containerGrowable}>
          <Controller
            control={control}
            name="pastedSeedPhrase"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInputField
                name="pastedSeedPhrase"
                style={textInput}
                errors={errors}
                label="SEED PHRASE"
                value={value}
                onBlur={onBlur}
                multiline={true}
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
        </View>

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
            tx="common.back"
            onPress={onButtonBack}
          />
        </SafeAreaView>
      </ScrollView>
    </AppScreen>
  )
}
