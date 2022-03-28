import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import {
  TextStyle,
  View,
  ViewStyle,
  StyleSheet,
  Alert,
  Modal,
  ImageBackground,
  ScrollView,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5"
import IonIcon from "react-native-vector-icons/Ionicons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { useForm, Controller } from "react-hook-form"
import Clipboard from "@react-native-clipboard/clipboard"

import { NavigatorParamList } from "../../navigators"
import { Button, Footer, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import {
  color,
  spacing,
  typography,
} from "../../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useStores } from "models"
import { Fonts } from "theme/fonts"
import { useNavigation } from "@react-navigation/native"
import { TextInputField } from "components/text-input-field/text-input-field"
import {
  BackgroundStyle,
  btnDefault,
  btnDisabled,
  CONTAINER,
  copyBtn,
  MainBackground,
  mnemonicContainer,
  mnemonicStyle,
  RootPageStyle,
} from "theme/elements"
import { StoredWallet } from "utils/stored-wallet"
import { showMessage } from "react-native-flash-message"
import { SvgXml } from "react-native-svg"
import backIcon from "../../../assets/svg/back.svg"
import { reset } from "../../utils/keychain"

const ROOT: ViewStyle = {
  ...RootPageStyle,

  flex: 1,
}
const MAIN_CONTAINER: ViewStyle = {
  ...CONTAINER,
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[3],
}
const SETTING_HEADER_CONTAINER: ViewStyle = {
  marginVertical: spacing[6],
}

const SETTING_HEADER: TextStyle = {
  fontSize: 24,
  fontFamily:typography.primaryBold,
  fontWeight:"700"
}
const WALLET_NAME: TextStyle = {
  fontSize: 14,
  color: color.palette.gold,
}
const SETTING_ITEM_WRAP: ViewStyle = {
  backgroundColor: color.palette.darkblack,
  borderRadius: 10,
}
const SETTING_ITEM_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[3],
}
const SETTING_ICON_CONTAINER: ViewStyle = {
  justifyContent: "center",
  display: "flex",
  flex: 1,
  alignItems: "center",
}
const SETTING_ICON: TextStyle = {
  fontSize: Fonts[1],
}
const SETTING_ITEM_BODY: ViewStyle = {
  display: "flex",
  flex: 6,
}
const SETTING_ITEM_TITLE: TextStyle = {
  fontSize: Fonts[1],
  fontWeight: "bold",
}

const NETWORK_TO_TESTNET: TextStyle = {
  padding: spacing[2],
  backgroundColor: color.success,
}

const NETWORK_TO_MAINNET: TextStyle = {
  padding: spacing[2],
  backgroundColor: color.error,
}
const SETTING_ITEM_SUBTITLE: TextStyle = {
  fontSize: Fonts[0],
}

const DashboardStyle: ViewStyle = {
  ...ROOT,
}

const styles = StyleSheet.create({
  DANGER_ZONE: {
    color: color.error,
    marginBottom: spacing[3],
    marginTop: spacing[6],
  },
  SEPARATOR: {
    borderBottomColor: color.palette.lineColor,
    borderBottomWidth: 1,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
  },
  centeredView: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginTop: 22,
  },
  error: {
    color: color.error,
  },
  mnemonicText: {
    color: color.palette.black,
  },
  modalText: {
    color: color.palette.black,
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    alignItems: "center",
    backgroundColor: color.palette.white,
    borderRadius: 20,
    elevation: 5,
    margin: 20,
    padding: 35,
    shadowColor: color.palette.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})

export const SettingsScreen: FC<StackScreenProps<NavigatorParamList, "settings">> = observer(
  function SettingsScreen() {
    // Pull in one of our MST stores
    const rootStore = useStores()
    const { currentWalletStore } = rootStore

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const [showPasswordModal, setShowPasswordModal] = React.useState(false)
    const [errorUnlockingWallet, setErrorUnlockingWallet] = React.useState(false)
    const [seedPhrase, setSeedPhrase] = React.useState("")
    const lockWallet = () => {
      currentWalletStore.close()
      reset().catch(null);
      navigation.navigate("chooseWallet")
    }

    const deleteWallet = async () => {
      const wallet = currentWalletStore.wallet
      if (wallet) {
        await currentWalletStore.removeWallet()
        currentWalletStore.close()
        reset().catch(null);
        navigation.navigate("chooseWallet")
      }
    }
    const deleteWalletConfirmation = async () => {
      Alert.alert("Delete wallet", "Are you sure you want to delete this wallet?", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            await deleteWallet()
          },
        },
      ])
    }

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
    } = useForm({ mode: "onChange" })

    const onPasswordSubmit = async (data: any) => {
      try {
        const storeWallet = await StoredWallet.loadFromStorage(
          currentWalletStore.name,
          data.password,
        )
        setErrorUnlockingWallet(false)
        setSeedPhrase(storeWallet.mnemonic)
      } catch (error) {
        console.log("error unblocking wallet ", error)
        setErrorUnlockingWallet(true)
        setSeedPhrase("")
      }
    }

    const copyToClipboard = () => {
      console.log("copying to clipboard")
      if (seedPhrase) {
        Clipboard.setString(seedPhrase)
      }
      showMessage({
        message: "mnemonic copied to clipboard",
        type: "success",
      })
    }

    const goBack = () => navigation.goBack()
    const goToChangePassword = () => navigation.navigate("changePassword")

    const toggleTestnet = () => {
      rootStore.setTestnet(!rootStore.TESTNET)
      // Reload the balance
      currentWalletStore.refreshBalances()
      showMessage({
        message: "You're now using " + (rootStore.TESTNET ? "Testnet" : "Mainnet"),
        type: "success",
      })
    }
    return (
      <Screen unsafe={true} style={DashboardStyle} preset="fixed">
        <ScrollView contentContainerStyle={BackgroundStyle}>
          <View>
            <View style={MAIN_CONTAINER}>
              <View>
                <View style={SETTING_HEADER_CONTAINER}>
                  <Text style={SETTING_HEADER} text="Wallet settings" />
                  <Text style={WALLET_NAME} text={currentWalletStore.name} />
                </View>
                <View style={SETTING_ITEM_WRAP}>
                  <TouchableOpacity style={SETTING_ITEM_CONTAINER} onPress={lockWallet}>
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon
                        style={SETTING_ICON}
                        name="lock"
                        color={color.palette.white}
                      />
                    </View>
                    <View style={SETTING_ITEM_BODY}>
                      <Text style={SETTING_ITEM_TITLE} text="Lock this wallet" />
                      <Text
                        style={SETTING_ITEM_SUBTITLE}
                        text="Lock this wallet and go back to home"
                      />
                    </View>
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon name="chevron-right" color={color.palette.lightGrey} />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.SEPARATOR} />

                  <TouchableOpacity
                    style={SETTING_ITEM_CONTAINER}
                    onPress={() => setShowPasswordModal(true)}
                  >
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon5
                        style={SETTING_ICON}
                        name="eye"
                        color={color.palette.white}
                      />
                    </View>
                    <View style={SETTING_ITEM_BODY}>
                      <Text style={SETTING_ITEM_TITLE} text="Reveal my seed phrase" />
                      <Text
                        style={SETTING_ITEM_SUBTITLE}
                        text="Reveal the seed phrase of the current wallet"
                      />
                    </View>
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon name="chevron-right" color={color.palette.lightGrey} />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.SEPARATOR} />

                  <TouchableOpacity style={SETTING_ITEM_CONTAINER} onPress={goToChangePassword}>
                    <View style={SETTING_ICON_CONTAINER}>
                      <MaterialCommunityIcons
                        style={SETTING_ICON}
                        name="account-key"
                        color={color.palette.white}
                      />
                    </View>
                    <View style={SETTING_ITEM_BODY}>
                      <Text style={SETTING_ITEM_TITLE} text="Change my password" />
                      <Text
                        style={SETTING_ITEM_SUBTITLE}
                        text="Change the unlock password of the current wallet"
                      />
                    </View>
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon name="chevron-right" color={color.palette.lightGrey} />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.SEPARATOR} />
                  <TouchableOpacity style={SETTING_ITEM_CONTAINER} onPress={toggleTestnet}>
                    <View style={SETTING_ICON_CONTAINER}>
                      <IonIcon
                        style={SETTING_ICON}
                        name="git-network-sharp"
                        color={color.palette.white}
                      />
                    </View>
                    <View style={SETTING_ITEM_BODY}>
                      <Text style={SETTING_ITEM_TITLE}>
                        <Text text="Switch to " />
                        <Text
                          style={rootStore.TESTNET ? NETWORK_TO_MAINNET : NETWORK_TO_TESTNET}
                          text={rootStore.TESTNET ? "Mainnet" : "Testnet"}
                        />
                      </Text>
                      <Text style={SETTING_ITEM_SUBTITLE} text="Switch to Mainnet or Testnet" />
                    </View>
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon name="chevron-right" color={color.palette.lightGrey} />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.DANGER_ZONE} text="DANGER ZONE"></Text>
                <View style={SETTING_ITEM_WRAP}>
                  <TouchableOpacity
                    style={SETTING_ITEM_CONTAINER}
                    onPress={deleteWalletConfirmation}
                  >
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon
                        style={SETTING_ICON}
                        name="trash-o"
                        color={color.palette.white}
                      />
                    </View>
                    <View style={SETTING_ITEM_BODY}>
                      <Text style={SETTING_ITEM_TITLE} text="Delete this wallet" />
                      <Text
                        style={SETTING_ITEM_SUBTITLE}
                        text="Delete the saved wallet form this app"
                      />
                    </View>
                    <View style={SETTING_ICON_CONTAINER}>
                      <FontAwesomeIcon name="chevron-right" color={color.palette.lightGrey} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <Modal animationType="slide" transparent={true} visible={showPasswordModal}>
                <View style={styles.centeredView}>
                  {!seedPhrase && (
                    <View style={styles.modalView}>
                      <Text style={styles.modalText}>Unlock wallet</Text>
                      <Controller
                        control={control}
                        defaultValue=""
                        name="password"
                        render={({ field: { onChange, value, onBlur } }) => (
                          <TextInputField
                            secureTextEntry={true}
                            name="password"
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
                      {errorUnlockingWallet && (
                        <Text style={styles.error} text="Couldn't unlock wallet" />
                      )}
                      <View style={styles.buttonContainer}>
                        <Button
                          style={btnDefault}
                          text="Cancel"
                          onPress={() => {
                            setErrorUnlockingWallet(false)
                            setShowPasswordModal(!showPasswordModal)
                          }}
                        ></Button>
                        <Button
                          style={[btnDefault, !isValid && { ...btnDisabled }]}
                          disabled={!isValid}
                          text="Continue"
                          onPress={handleSubmit(onPasswordSubmit)}
                        />
                      </View>
                    </View>
                  )}
                  {!!seedPhrase && (
                    <View style={styles.modalView}>
                      <Text style={styles.modalText}>Unlock wallet</Text>
                      <View style={mnemonicContainer}>
                        <Text style={[mnemonicStyle, styles.mnemonicText]} text={seedPhrase} />
                        <TouchableOpacity style={copyBtn} onPress={copyToClipboard}>
                          <FontAwesomeIcon5 name="clipboard-check" size={23} />
                        </TouchableOpacity>
                      </View>
                      <Button
                        style={btnDefault}
                        text="Close"
                        onPress={() => {
                          setErrorUnlockingWallet(false)
                          setSeedPhrase("")
                          setShowPasswordModal(!showPasswordModal)
                        }}
                      ></Button>
                    </View>
                  )}
                </View>
              </Modal>
            </View>
          </View>
        </ScrollView>
        <Footer onLeftButtonPress={goBack}></Footer>
      </Screen>
    )
  },
)
