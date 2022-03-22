import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageBackground, ImageStyle, ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import SplashScreen from "react-native-splash-screen"
import { NavigatorParamList } from "../../navigators"
import { AppScreen, Button, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { getListOfWallets } from "../../utils/storage"
import { useForm, Controller } from "react-hook-form"
import {
  BackgroundStyle,
  btnDefault,
  btnDisabled,
  CONTAINER,
  DropdownArrowStyle,
  DropdownContainerStyle,
  DropdownListStyle,
  DropdownTextStyle,
  footBtn,
  headerTitle,
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

import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import eyeIcon from "../../../assets/svg/eye.svg"
import unlockIcon from "../../../assets/svg/unlock.svg"
import fingerIcon from "../../../assets/svg/finger.svg"

import { SvgXml } from "react-native-svg"
import { defaultAssets } from "utils/consts"

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
    justifyContent: "flex-start",
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
  const { currentWalletStore } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const [walletNames, setWalletNames] = useState<string[]>([])

  useEffect(() => {
    SplashScreen.hide()
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
      showMessage({ message: "Wallet unlocked", type: "success" })
      currentWalletStore.open(loadedWallet as any)

      navigation.navigate("dashboard")
    } catch (err) {
      console.log(err)
      showMessage({ message: "Unable to unlock this wallet", type: "danger" })
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   getListOfWallets().then((walletNames) => {
  //     console.log({ walletNames })
  //     setWalletNames(walletNames)
  //     if (walletNames.length === 1) {
  //       setItemValue(walletNames[0])
  //     }
  //     onSubmit({ walletName: "test", walletPassword: "testtest" })
  //   })
  // }, [])

  return (
    <Screen preset="scroll" style={RootPageStyle} backgroundColor={color.palette.black}>
      <ImageBackground source={MainBackground} style={BackgroundStyle}>
        <AppScreen>
          <ScrollView contentContainerStyle={CONTAINER}>
            <View>
              <Header
                headerText="Unlock your wallet"
                style={headerStyle}
                titleStyle={headerTitleSTYLE}
              />
              <Text style={[NORMAL_TEXT, TEXT_CENTTER]}>
                The restoration of your wallet is successful. You are now ready to manage your
                assets.
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
                      arrowIconStyle={DropdownArrowStyle}
                      listItemContainerStyle={DropdownListStyle}
                      theme={"DARK"}
                      open={open}
                      value={itemValue}
                      items={walletNames.map((item) => ({ label: item, value: item }))}
                      setOpen={setOpen}
                      setValue={setItemValue}
                      placeholder="Select a wallet"
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
                    label="Unlock password"
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
              <SvgXml width={64} height={64} xml={fingerIcon} />
            </View>
          </ScrollView>
        </AppScreen>
      </ImageBackground>
    </Screen>
  )
})
