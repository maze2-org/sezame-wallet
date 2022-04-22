import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle, StyleSheet, Alert, Modal, ScrollView, Dimensions, Pressable, } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5"
import IonIcon from "react-native-vector-icons/Ionicons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { useForm, Controller } from "react-hook-form"
import Clipboard from "@react-native-clipboard/clipboard"

import { NavigatorParamList } from "../../navigators"
import { Button, Footer, Screen, Text } from "../../components"
import { color, spacing, typography } from "../../theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useStores } from "models"
import { Fonts } from "theme/fonts"
import { useNavigation } from "@react-navigation/native"
import { TextInputField } from "components/text-input-field/text-input-field"
import IonIcons from "react-native-vector-icons/Ionicons"
import copyIcon from "../../../assets/icons/copy.svg"
import { SvgXml } from "react-native-svg"
import { CommonActions } from '@react-navigation/native';
import { btnDefault, btnDisabled, CONTAINER, copyBtn, mnemonicContainer, mnemonicStyle, RootPageStyle, } from "theme/elements"
import { StoredWallet } from "utils/stored-wallet"
import { showMessage } from "react-native-flash-message"
import { reset } from "../../utils/keychain"

const { height } = Dimensions.get("screen")

const ROOT: ViewStyle = {
  ...RootPageStyle,

  flex: 1,
}
const SCROLL_VIEW_CONTAINER: ViewStyle = {
  flexGrow: 1,
  justifyContent: "space-between",
  backgroundColor: color.palette.black,
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
  fontFamily: typography.primaryBold,
  fontWeight: "700",
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
const RECEIVE_MODAL_WRAPPER: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: height,
  backgroundColor: "rgba(0,0,0,0.3)",
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
    marginTop: spacing[3],
    justifyContent: 'center'
  },
  centeredView: {
    width:'100%',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  error: {
    color: color.error,
  },
  mnemonicText: {
    color: color.palette.white,
  },
  modalText: {
    color: color.palette.white,
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    width: 317,
    backgroundColor: color.palette.noise,
    borderRadius: 20,
    elevation: 5,
    padding: 35,
    shadowColor: color.palette.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  closeWrapper: {
    position:'absolute',
    top:10,
    right:10,
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
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'chooseWallet' },
          ],
        })
      );
    }

    const deleteWallet = async () => {
      const wallet = currentWalletStore.wallet
      if (wallet) {
        await currentWalletStore.removeWallet()
        currentWalletStore.close()
        reset()
          .then(() => {
            navigation.navigate("chooseWallet")
            showMessage({
              message:"Wallet has been deleted",
              type:"success"
            })
          })
          .catch(null)
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
      if (seedPhrase) {
        Clipboard.setString(seedPhrase)
      }
      showMessage({
        message: "seed phrase copied to clipboard",
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
        <ScrollView contentContainerStyle={SCROLL_VIEW_CONTAINER}>
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
                <Text style={styles.DANGER_ZONE} text="DANGER ZONE"/>
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

              <Modal
                animationType="fade"
                transparent={true}
                visible={showPasswordModal}
                // onRequestClose={()=>setShowPasswordModal(false)}
              >
                <Pressable
                  onPress={() => setShowPasswordModal(false)}
                >
                  <View style={RECEIVE_MODAL_WRAPPER}>
                    <Pressable style={styles.centeredView}>
                      {!seedPhrase && (
                        <View
                          style={styles.modalView}>
                          <View
                            style={styles.closeWrapper}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              hitSlop={{
                                top: 10,
                                left: 10,
                                right: 10,
                                bottom: 10,
                              }}
                              onPress={() => setShowPasswordModal(false)}
                            >
                              <IonIcons
                                name={"close-outline"}
                                size={30}
                                color={color.palette.white} />
                            </TouchableOpacity>
                          </View>
                          <Text
                            style={styles.modalText}>Reveal my seed phrase
                            </Text>
                          <Controller
                            control={control}
                            defaultValue=""
                            name="password"
                            render={({
                                       field: {
                                         onChange,
                                         value,
                                         onBlur,
                                       },
                                     }) => (
                              <TextInputField
                                secureTextEntry={true}
                                name="password"
                                errors={errors}
                                placeholder="Enter your wallet password"
                                value={value}
                                onBlur={onBlur}
                                placeholderTextColor={color.palette.white}
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
                            <Text
                              style={styles.error}
                              text="Couldn't unlock wallet" />
                          )}
                          <View
                            style={styles.buttonContainer}>
                            <Button
                              style={{
                                zIndex: 10,
                                marginRight: 10,
                              }}
                              preset={"secondary"}
                              text="Cancel"
                              onPress={() => {
                                console.log(123123)
                                setErrorUnlockingWallet(false)
                                setShowPasswordModal(!showPasswordModal)
                              }}
                            />
                            <Button
                              style={[!isValid && { ...btnDisabled }]}
                              preset={"secondary"}
                              disabled={!isValid}
                              text="Continue"
                              onPress={handleSubmit(onPasswordSubmit)}
                            />
                          </View>
                        </View>
                      )}
                      {!!seedPhrase && (
                        <View
                          style={styles.modalView}>
                          <Text
                            style={styles.modalText}>Unlock
                            wallet</Text>
                          <View
                            style={mnemonicContainer}>
                            <Text
                              style={[mnemonicStyle, styles.mnemonicText]}
                              text={seedPhrase} />
                            <TouchableOpacity
                              style={copyBtn}
                              onPress={copyToClipboard}>
                              <SvgXml width="20" height="20" xml={copyIcon} />
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
                          />
                        </View>
                      )}
                  </Pressable>
                  </View>
                </Pressable>
              </Modal>
            </View>
          </View>
        </ScrollView>
        <Footer onLeftButtonPress={goBack}/>
      </Screen>
    )
  },
)
