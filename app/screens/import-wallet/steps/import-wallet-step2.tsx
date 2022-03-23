import React, { useRef, useState, useEffect, useContext} from "react"
import {
  View,
  TextInput,
  TextStyle,
  ViewStyle,
  ImageStyle,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native"
import { StepProps } from "utils/MultiStepController/Step"
import { bip39Words } from "../../../utils/bip39Words"
import { StepsContext } from "utils/MultiStepController/MultiStepController"
import { StoredWallet } from "utils/stored-wallet"
import { defaultAssets } from "utils/consts"
import { WalletImportContext } from "../import-wallet-screen"
import { color, spacing, typography } from "theme"
import {
  Button,
  Header,
  Text,
  AppScreen,
  AutoImage as Image,
} from "components"
import {
  CONTAINER,
  NORMAL_TEXT,
  PRIMARY_BTN,
  btnDisabled,
  headerTitle,
  PRIMARY_TEXT,
  PRIMARY_OUTLINE_BTN,
} from "theme/elements"

const SEARCH_WRAPPER: ViewStyle = {
  marginTop: spacing[4]
}

const SEARCH_CONTAINER: ViewStyle = {
  flexDirection:'row',
  flexWrap:'wrap',
  borderBottomWidth: 1,
  borderColor: color.palette.white,
  alignItems: 'center',
}

const INPUT: TextStyle = {
  flexGrow:1,
  minWidth: 100,
  fontFamily: typography.primary,
  color: color.text,
  minHeight: 44,
  fontSize: 15,
  lineHeight: 20,
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[0],
}

const LABEL: TextStyle = {
  fontSize: 10,
  lineHeight: 14,
  color: color.palette.grey,
  fontWeight: "600",
  textTransform: "uppercase",
}

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

const nextIcon = require("../../../../assets/icons/next.png")

export function ImportWalletStep2(props: StepProps) {
  const allowedWords = useRef(bip39Words.split(" "));
  const scrollViewRef = useRef(null);
  const { walletName, walletPassword } = useContext(WalletImportContext);
  const { onButtonBack, onButtonNext } = useContext(StepsContext);

  const [value, setValue] = useState<string>('');
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setLoading(true)
    const storedWallet = new StoredWallet(walletName, selectedWords.join(" "), walletPassword)
    await storedWallet.addAssets(defaultAssets)
    await storedWallet.save()
    setLoading(false)
    onButtonNext();
  }

  useEffect(() => {
    const availableWords = []
    allowedWords.current.forEach((word) => {
      if (
        value &&
        selectedWords.indexOf(word) === -1 &&
        word.toLowerCase().substring(0, value.length) === value.toLowerCase()
      )
        availableWords.push(word)
    })
    setWhitelist(availableWords.slice(0, 20))
    setTimeout(()=>{
      if(contentHeight){
        scrollViewRef?.current && scrollViewRef.current.scrollTo(contentHeight);
      }else {
        scrollViewRef?.current && scrollViewRef.current.scrollToEnd();
      }
    },0)
  }, [value])

  useEffect(() => {
    if (selectedWords.length < 12) setIsValid(true)
    else if (selectedWords.length > 24) setIsValid(true)
    else setIsValid(false)
  }, [selectedWords])

  const changeTextHandler = (value: string, checkWithoutSpace?: boolean)=>{
    if(!!checkWithoutSpace || value.indexOf(' ') !== -1){
      const wordsArray: string[] = value.split(' ');
      const validWordsArr = wordsArray.filter(
        word => !!word.trim() &&
          (
            whitelist.length > 0 && whitelist.includes(word.trim()) ||
              whitelist.length <= 0 && allowedWords.current.includes(word.trim())
          )
      );
      if(validWordsArr.length > 0) {
        setSelectedWords([...selectedWords, ...validWordsArr]);
      }
      setValue('')
      return;
    }

    setValue(value)
  }

  const renderSelectedWords = () => {
    return selectedWords.map((w, index) => (
      <View
        key={index}
        style={whitelistItemStyle}
        onStartShouldSetResponder={() => {
          const updatedSelectedWords = selectedWords.filter((_,wordIndex)=> index !== wordIndex);
          setSelectedWords(updatedSelectedWords)
          return true
        }}
      >
        <Text text={w} style={NORMAL_TEXT} />
      </View>
    ))
  }

  const renderRemainingWords = () => {
    return whitelist.map((w, index) => (
      <View
        style={whitelistItemStyle}
        key={index}
        onStartShouldSetResponder={() => {
          setSelectedWords([...selectedWords, w]);
          setValue('');
          return true
        }}
      >
        <Text text={w} style={NORMAL_TEXT} />
      </View>
    ))
  }

  return (
    <AppScreen {...props}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={CONTAINER}
        keyboardDismissMode={'none'}
        keyboardShouldPersistTaps={'handled'}
        onContentSizeChange={(height) => {setContentHeight(height)}}
      >
        <SafeAreaView {...props}>
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
            <View style={SEARCH_WRAPPER}>
            <Text preset="fieldLabel" text={'SEED PHRASE'} style={LABEL}/>

            <View style={SEARCH_CONTAINER}>
              {renderSelectedWords()}
              <TextInput
                value={value}
                secureTextEntry={true}
                keyboardType={Platform.select({
                  ios: 'default',
                  android: 'visible-password'
                })}
                autoCorrect={false}
                autoCapitalize={'none'}
                placeholderTextColor={color.palette.lighterGrey}
                underlineColorAndroid={color.transparent}
                style={INPUT}
                onChangeText={changeTextHandler}
                // onBlur={() => changeTextHandler(value,true)}
              />
            </View>
          </View>
            <View style={whitelistContainerStyle}>{renderRemainingWords()}</View>
          </View>

          <SafeAreaView>
            <Button
              testID="next-screen-button"
              style={[PRIMARY_BTN, isValid && { ...btnDisabled }]}
              textStyle={PRIMARY_TEXT}
              onPress={onSubmit}
              disabled={isValid || !!loading}
            >
              <Text text={loading ? "Loading ..." : 'NEXT'}/>
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
      </SafeAreaView>
      </ScrollView>
    </AppScreen>
  )
}
