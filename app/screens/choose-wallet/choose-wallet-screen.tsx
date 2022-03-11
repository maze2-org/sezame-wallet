import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageBackground, ImageStyle, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import SplashScreen from "react-native-splash-screen"
import { NavigatorParamList } from "../../navigators"
import { AppScreen, Button, Drawer, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { getListOfWallets } from "../../utils/storage"
import { useForm, Controller } from "react-hook-form"
import { BackgroundStyle, btnDefault, btnDisabled, CONTAINER, DropdownArrowStyle, DropdownContainerStyle, DropdownListStyle, DropdownTextStyle, footBtn, headerTitle, MainBackground, NORMAL_TEXT, PRIMARY_BTN, PRIMARY_OUTLINE_BTN, PRIMARY_TEXT, RootPageStyle, SMALL_TEXT, textInput, TEXT_CENTTER } from "../../theme/elements"
import DropDownPicker from "react-native-dropdown-picker"
import { TextInputField } from "../../components/text-input-field/text-input-field"
import { StoredWallet } from "../../utils/stored-wallet"
import { showMessage } from "react-native-flash-message"

import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import eyeIcon from "../../../assets/svg/eye.svg"
import unlockIcon from "../../../assets/svg/unlock.svg"
import fingerIcon from "../../../assets/svg/finger.svg"

import { SvgXml } from "react-native-svg"
const testWallet = {
  toJson: () => ({
    assets: [
      {
        symbol: "BTC",
        name: "Bitcoin",
        cid: "bitcoin",
        chain: "BTC",
        type: "coin",
        decimals: 8,
        privateKey: "L39MEEJrM9SXb4WjSj7GGfz49FuwsvcPoCXCXnjQAEgxHTyUMTHb",
        publicKey:
          "xpub6EKA4LLy7XLcovpb2mJEfCrW9CzTx91s6H5x7qncz9Bmp2NQ439viJtf3gkNdyno2CgMXL9mSz2VPCo5u5xzvMYVCmuNxXfjHuU1T5vXTwa",
        address: "bc1qx6juea389gv4g3qzz0vwmzjjjhxwtdvzmk2e6c",
        balance: 0,
        value: 0,
        rate: 0,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        version: 1,
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        cid: "ethereum",
        chain: "ETH",
        type: "coin",
        decimals: 18,
        privateKey: "0x2480f77700e65da805193baa25aa1040ce681ba5ff375c9d9e74d37e4d71cff2",
        publicKey:
          "xpub6FNC5Tk9QdSKa3c48WUmMZbo3Skmh77Q3ki12CKr8g5bX1SSqJRtnwB4GL8bUZ6CRoajx1HoA1uW95ELWva1pWp5AoPgqimUMsFVVBYWyEn",
        address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
        balance: 0,
        value: 0,
        rate: 0,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        version: 1,
      },
    ],
    walletName: "test8",
    mnemonic:
      "cliff luggage vintage quality viable sheriff round sweet forward ostrich liberty design",
    creationDate: "2022-02-23T06:35:59.447Z",
    password: "test",
  }),
}


export const ChooseWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "chooseWallet">
> = observer(function ChooseWalletScreen() {
  const headerStyle: ViewStyle = {
    justifyContent: "center",
    paddingHorizontal: spacing[0],
    width: "100%",
  }
  
  const CONTAINER_STYLE: ViewStyle = {
    ...CONTAINER,
    justifyContent: "flex-start"
  }

  const buttonIconStyle: ImageStyle = {
    position: "absolute",
    left: 15,
  }

  const headerTitleSTYLE: TextStyle = {
    ...headerStyle,
    fontSize: 27,
    lineHeight: 37,
    fontWeight: "700"
  }
  const footerStyle: TextStyle = {
    display: "flex",
    width: "100%",
    alignItems:"center",
  }
  const BUTTON_STYLE: ViewStyle = {
    ...PRIMARY_BTN,
    marginTop: spacing[6],
    marginBottom: spacing[3]
  }
  const { currentWalletStore } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const [walletNames, setWalletNames] = useState<string[]>([])

  useEffect(() => {
    SplashScreen.hide()
  }, [])

  useEffect(() => {
    getListOfWallets().then((walletNames) => {
      console.log({ walletNames })
      setWalletNames(walletNames)
      if (walletNames.length === 1) {
        setItemValue(walletNames[0])
      }
    })
  }, [])

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [itemValue, setItemValue] = useState(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const loadedWallet = await StoredWallet.loadFromStorage(data.walletName, data.walletPassword)

      showMessage({ message: "Wallet decrypted", type: "success" })
      console.log("loaded wallet ", JSON.stringify(loadedWallet))
      currentWalletStore.open(loadedWallet as any)
      navigation.navigate("dashboard")
    } catch (err) {
      console.log(err)
      showMessage({ message: "Unable to decrypt this wallet", type: "danger" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen preset="scroll" style={RootPageStyle}>
      <ImageBackground source={MainBackground} style={BackgroundStyle}>
        <AppScreen>
          <Drawer title="Choose something" />
          <ScrollView contentContainerStyle={CONTAINER}>
            <View>
              <Header
                headerText="Unlock your wallet"
                style={headerStyle}
                titleStyle={headerTitleSTYLE}
              />
              <Text style={[NORMAL_TEXT, TEXT_CENTTER]}>
                The restoration of your wallet is successful. You are now ready to manage your assets.
              </Text>
            </View>
            <View>
              <Controller
                control={control}
                name="walletName"
                render={({ field: { onChange, value, onBlur } }) => (
                  <>
                    <Text style={SMALL_TEXT}>CHOOSE YOUR WALLET</Text>
                    <DropDownPicker
                        style={DropdownContainerStyle}
                        textStyle={DropdownTextStyle}
                        arrowIconStyle={DropdownArrowStyle}
                        listItemContainerStyle={DropdownListStyle}
                        theme={"DARK"}
                        open={open}
                        value={itemValue}
                        items={walletNames.map((item) => ({ label: item, value: item }))}
                        setOpen={setOpen}
                        setValue={setItemValue}
                        onChangeValue={(val) => {
                          console.log(val)
                          onChange(val)
                          setValue("walletName", val)
                        }}
                      />
                  </>
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
                defaultValue=""
                name="walletPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInputField
                    label="Choose a password"
                    secureTextEntry={true}
                    name="walletPassword"
                    icon={eyeIcon}
                    style={textInput}
                    errors={errors}
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
              <Button
                textStyle={PRIMARY_TEXT}
                style={[BUTTON_STYLE, !isValid && { ...btnDisabled }, loading && { ...btnDisabled }]}
                disabled={!isValid || loading}
                text={loading ? "Loading ..." : "Continue"}
                onPress={handleSubmit(onSubmit)}
              >
                <Text text={loading ? "Loading ..." : "UNLOCK"}/>
                <SvgXml width="24" height="24" xml={unlockIcon} style={buttonIconStyle}/>
              </Button>
              <Button
                testID="next-screen-button"
                style={PRIMARY_OUTLINE_BTN}
                textStyle={PRIMARY_TEXT}
                text="Create or import a new wallet"
                onPress={() => navigation.replace("welcome")}
              />
            </View>
            <View style={footerStyle}>
              <SvgXml width={64} height={64} xml={fingerIcon}/>
            </View>
          </ScrollView>
        </AppScreen>
      </ImageBackground>
    </Screen>
      
    
  )
})
