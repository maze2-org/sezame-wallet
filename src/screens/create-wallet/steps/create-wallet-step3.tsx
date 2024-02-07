import React, { useContext, useEffect, useState } from "react"
import { ImageStyle, Platform, SafeAreaView, TextInput, TextStyle, View, ViewStyle, } from "react-native"
import { Button, Header, Text, AutoImage as Image, AppScreen } from "components"
import { useForm, useWatch } from "react-hook-form"
import { btnDisabled, CONTAINER, containerGrowable, headerTitle, NORMAL_TEXT, PRIMARY_BTN, PRIMARY_OUTLINE_BTN, PRIMARY_TEXT, } from "theme/elements"
import { useStores } from "models"
import { StepProps } from "utils/MultiStepController/Step"
import { StepsContext } from "utils/MultiStepController/MultiStepController"
import { WalletCreateContext } from "../create-wallet-screen"
import { color, spacing, typography, } from "theme"
import { ScrollView } from "react-native-gesture-handler"


export function CreateWalletStep3(props: StepProps) {

  const nextIcon = require("@assets/icons/next.png")
  const { seedPhrase } = useContext(WalletCreateContext)
  const { control, setValue, formState: { errors }, } = useForm({ mode: "onChange" })

  const pastedSeedPhrase = useWatch({ control, name: "pastedSeedPhrase", defaultValue: "", })
  const {setOverlayLoadingShown, overlayLoadingShown} = useStores()
  const { onButtonBack, onButtonNext } = useContext(StepsContext)
  const [words, setWords] = useState([])
  const [usedWords, setUsedWords] = useState([])
  const [valueInput, setValueInput] = useState('');
  const [validate, setValidate] = useState(false)

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
  const SEARCH_CONTAINER: ViewStyle = {
    flexDirection:'row',
    flexWrap:'wrap',
    borderBottomWidth: 1,
    borderColor: color.palette.white,
    alignItems: 'center',
  }
  const SEARCH_WRAPPER: ViewStyle = {
    marginTop:spacing[4]
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

  const renderRemainingWords = () => {
    return words
      .filter((w) => !usedWords.includes(w))
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((w, index) => (
        <View
          key={w}
          style={whitelistItemStyle}
          onStartShouldSetResponder={() => {
            setUsedWords([...usedWords,w])
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

  const renderSelectedWords = () => {
    return usedWords.map((w, index) => (
      <View
        key={index}
        style={whitelistItemStyle}
        onStartShouldSetResponder={() => {
          const updatedSelectedWords = usedWords.filter((_,wordIndex)=> index !== wordIndex);
          setUsedWords(updatedSelectedWords)
          return true
        }}
      >
        <Text text={w} style={NORMAL_TEXT} />
      </View>
    ))
  }

  const changeTextHandler = (value) => {
    if(value.indexOf(' ') !== -1){
      const wordsArray: string[] = value.split(' ');
      const validWordsArr = wordsArray.filter(word =>!!word.trim() &&  words.includes(word.trim()));
      validWordsArr.length > 0 && setUsedWords([...usedWords, ...validWordsArr]);
      setValueInput('')
      return
    }
    setValueInput(value)
  }

  useEffect(()=>{
    if(usedWords.join(' ') === seedPhrase){
      setValidate(true)
    }else{
      setValidate(false)
    }


  },[usedWords, words])

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

          <View style={SEARCH_WRAPPER}>
             <Text preset="fieldLabel" text={'SEED PHRASE'} style={LABEL}/>
              <View style={SEARCH_CONTAINER}>
                  {renderSelectedWords()}
                  <TextInput
                    value={valueInput}
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
                  />
                </View>
            </View>
            <View style={whitelistContainerStyle}>
               {renderRemainingWords()}
            </View>
        </View>

        <SafeAreaView>

          <Button
            testID="next-screen-button"
            style={[PRIMARY_BTN, !validate && { ...btnDisabled }]}
            textStyle={PRIMARY_TEXT}
            onPress={()=>{
              setOverlayLoadingShown(true)
              onButtonNext(()=>{
                setOverlayLoadingShown(false)
              })
            }}
            disabled={!validate || overlayLoadingShown}
          >
            <Text text={overlayLoadingShown ? "Loading ..." : 'NEXT'}/>
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
