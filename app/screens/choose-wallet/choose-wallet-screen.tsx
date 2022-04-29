import React, { FC, useEffect, useState, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { ImageBackground, ImageStyle, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import SplashScreen from "react-native-splash-screen"
import { NavigatorParamList } from "../../navigators"
import { AppScreen, Button, Header, Screen, Text } from "../../components"
import { color, spacing, typography } from "../../theme"
import { getListOfWallets } from "../../utils/storage"
import { useForm, Controller } from "react-hook-form"
import { SvgXml } from "react-native-svg"
import { Biometrics } from "../../components/biometrics/biometrics"
import {
  BackgroundStyle,
  CONTAINER,
  DropdownArrowStyle,
  DropdownContainerStyle,
  DropdownListStyle,
  DropdownTextStyle,
  MainBackground,
  NORMAL_TEXT,
  PRIMARY_BTN,
  PRIMARY_OUTLINE_BTN,
  PRIMARY_TEXT,
  RootPageStyle,
  SMALL_TEXT,
  textInput,
  TEXT_CENTTER,
} from "../../theme/elements"
import DropDownPicker from "react-native-dropdown-picker"
import { TextInputField } from "../../components/text-input-field/text-input-field"
import { StoredWallet } from "../../utils/stored-wallet"
import { showMessage } from "react-native-flash-message"
import { reset, save, IKeychainData, load } from "../../utils/keychain"

import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import eyeIcon from "../../../assets/svg/eye.svg"
import unlockIcon from "../../../assets/svg/unlock.svg"

const headerStyle: ViewStyle = {
  justifyContent: "center",
  paddingHorizontal: spacing[0],
  width: "100%",
}

const buttonIconStyle: ImageStyle = {
  position: "absolute",
  left: 15,
}

const headerTitleSTYLE: TextStyle = {
  ...headerStyle,
  fontSize: 27,
  lineHeight: 37,
  fontWeight: "700",
  fontFamily: typography.primaryBold,
}
const footerStyle: TextStyle = {
  display: "flex",
  width: "100%",
  alignItems: "center",
}
const BUTTON_STYLE: ViewStyle = {
  ...PRIMARY_BTN,
  marginTop: spacing[6],
  marginBottom: spacing[3],
}

const VIEW_WRAPPER: ViewStyle = {
  flex: 1,
}
const SCROLL_VIEW_WRAPPER: ViewStyle = {
  flexGrow: 1,
}

export const ChooseWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "chooseWallet">
> = observer(function ChooseWalletScreen() {
  const { currentWalletStore, pendingTransactions, exchangeRates } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [itemValue, setItemValue] = useState(null)
  const [walletNames, setWalletNames] = useState<string[]>([])

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
      showMessage({ message: "Wallet unlocked", type: "success" })
      currentWalletStore.open(loadedWallet as any)
      const cids = currentWalletStore.assets.map((asset) => {
        return asset.cid
      })
      exchangeRates.addCurrencies(cids)

      pendingTransactions.open()

      getKCData()
        .then(async (keyData) => {
          let parsedWallets = keyData ? JSON.parse(keyData.password) : []
          let wallets = Array.isArray(parsedWallets) ? parsedWallets : []
          const indexFound = wallets.findIndex((wallet) => wallet.walletName === data.walletName)

          const walletToAdd = {
            walletName: data.walletName,
            walletPassword: data.walletPassword,
          }
          if (indexFound === -1) {
            wallets.push(walletToAdd)
          } else {
            wallets[indexFound] = walletToAdd
          }

          await save("wallets", JSON.stringify(wallets)).catch(null)
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          navigation.replace("dashboard")
        })
    } catch (err) {
      console.log(err)
      showMessage({ message: "Unable to unlock this wallet", type: "danger" })
    } finally {
      setLoading(false)
    }
    setValue("walletPassword", "")
  }

  const onGetKeychainData = (keychainData: IKeychainData) => {
    setItemValue(keychainData.username)
    setValue("walletName", keychainData.username)
    // setValue('walletPassword',keychainData.password)
    const data = {
      walletName: keychainData.username,
      walletPassword: keychainData.password,
    }
    onSubmit(data)
  }

  const getKCData = () => {
    return load()
      .then((savedData) => {
        const parsedWallet = JSON.parse(savedData.password)
        if (savedData && !!savedData.password && Array.isArray(parsedWallet)) {
          return savedData
        } else {
          return null
        }
      })
      .catch(() => {
        return null
      })
  }

  useEffect(() => {
    SplashScreen.hide()

    getListOfWallets().then((walletNames) => {
      setWalletNames(walletNames)
      if (walletNames.length === 1) {
        setItemValue(walletNames[0])
      }
      // onSubmit({ walletName: "test", walletPassword: "testtest" })
    })
  }, [])
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getListOfWallets().then((walletNames) => {
        setWalletNames(walletNames)
        if (walletNames.length === 1) {
          setItemValue(walletNames[0])
        }
      })
    })
    return unsubscribe
  }, [navigation])

  const ScrollComponent = useMemo(() => (open ? View : ScrollView), [open])

  return (
    <Screen preset="fixed" style={RootPageStyle} backgroundColor={color.palette.black}>
      <ImageBackground source={MainBackground} style={BackgroundStyle}>
        <ScrollComponent
          style={VIEW_WRAPPER}
          contentContainerStyle={SCROLL_VIEW_WRAPPER}
          bounces={false}
        >
          <AppScreen>
            <View style={CONTAINER}>
              <View>
                <Header
                  headerText="Unlock your wallet"
                  style={headerStyle}
                  titleStyle={headerTitleSTYLE}
                />
                <Text style={[NORMAL_TEXT, TEXT_CENTTER]}>
                  Your wallets are currently locked. Select the wallet you wish to access then press
                  the fingerprint icon or provide the password.
                </Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name="walletName"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <>
                      <Text style={SMALL_TEXT}>WALLETS</Text>
                      <DropDownPicker
                        style={DropdownContainerStyle}
                        textStyle={DropdownTextStyle}
                        // arrowIconStyle={DropdownArrowStyle}
                        listItemContainerStyle={DropdownListStyle}
                        theme={"DARK"}
                        open={open}
                        value={itemValue}
                        items={walletNames.map((item) => ({ label: item, value: item }))}
                        setOpen={setOpen}
                        setValue={setItemValue}
                        placeholder="Select a wallet"
                        onChangeValue={(val) => {
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
                      label="Unlock password"
                      name="walletPassword"
                      showEye={true}
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
                  style={BUTTON_STYLE}
                  disabled={!isValid || loading}
                  text={loading ? "Loading ..." : "Continue"}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text text={loading ? "Loading ..." : "UNLOCK"} />
                  <SvgXml width="24" height="24" xml={unlockIcon} style={buttonIconStyle} />
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
                <Biometrics walletName={itemValue} onLoad={onGetKeychainData} />
              </View>
            </View>
          </AppScreen>
        </ScrollComponent>
      </ImageBackground>
    </Screen>
  )
})
