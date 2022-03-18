import React, { useContext, useEffect, useRef, useState } from "react"
import { ImageStyle, SafeAreaView, View, ViewStyle } from "react-native"
import { Button, Header, Text, AutoImage as Image, TextField } from "components"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  btnDisabled,
  CONTAINER,
  headerTitle,
  NORMAL_TEXT,
  PRIMARY_BTN,
  PRIMARY_OUTLINE_BTN,
  PRIMARY_TEXT,
} from "theme/elements"
import { StepProps } from "utils/MultiStepController/Step"
import { StepsContext } from "utils/MultiStepController/MultiStepController"
import { WalletImportContext } from "../import-wallet-screen"
import { spacing } from "theme"
import { bip39Words } from "../../../utils/bip39Words"
import { StoredWallet } from "utils/stored-wallet"
import { TextInputField } from "components/text-input-field/text-input-field"

export function ImportWalletStep2(props: StepProps) {
  const nextIcon = require("../../../../assets/icons/next.png")
  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm({ mode: "all", defaultValues: { keyword: "" } })

  const keyword = useWatch({
    control,
    name: "keyword",
    defaultValue: "",
  })

  const { walletName, walletPassword } = useContext(WalletImportContext)

  const onSubmit = async (data) => {
    const storedWallet = new StoredWallet(walletName, data.seedPhrase, walletPassword)
    await storedWallet.save()

    onButtonNext()
  }

  const { onButtonBack, onButtonNext } = useContext(StepsContext)
  // const [keyword, setKeyword] = useState("")
  const [whitelist, setWhitelist] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [isValid, setIsValid] = useState(true)
  useEffect(() => {
    const availableWords = []
    allowedWords.current.forEach((word) => {
      if (
        word.substring(0, keyword.length) === keyword &&
        keyword &&
        selectedWords.indexOf(word) === -1
      )
        availableWords.push(word)
    })
    setWhitelist(availableWords.slice(0, 20))
  }, [keyword])

  useEffect(() => {
    if (selectedWords.length < 12) setIsValid(true)
    else if (selectedWords.length > 24) setIsValid(true)
    else setIsValid(false)
  }, [selectedWords])

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
  const allowedWords = useRef(bip39Words.split(" "))

  const renderRemainingWords = () => {
    return whitelist.map((w, index) => (
      <>
        <View
          style={whitelistItemStyle}
          key={index}
          onStartShouldSetResponder={() => {
            setSelectedWords([...selectedWords, w])
            resetField("keyword")
            whitelist.splice(index, 1)
            return true
          }}
        >
          <Text text={w} style={NORMAL_TEXT} />
        </View>
      </>
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
        <View>
          <TextField
            label="Seed phase"
            multiline={true}
            value={selectedWords.join(" ")}
            editable={false}
          />
          <Controller
            control={control}
            name="keyword"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInputField
                value={value}
                label="Next word"
                errors={errors}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />

          <View style={whitelistContainerStyle}>{renderRemainingWords()}</View>
        </View>

        <SafeAreaView>
          <Button
            testID="next-screen-button"
            style={[PRIMARY_BTN, isValid && { ...btnDisabled }]}
            textStyle={PRIMARY_TEXT}
            onPress={handleSubmit(onSubmit)}
            disabled={isValid}
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
      </View>
    </SafeAreaView>
  )
}
