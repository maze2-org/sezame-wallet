import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  ImageBackground,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import BigNumber from "bignumber.js"

import {
  Button,
  CurrencyDescriptionBlock,
  Drawer,
  Footer,
  Screen,
  Text,
  WalletButton,
} from "../../components"

import { color, spacing } from "../../theme"
import { Controller, useForm, useWatch } from "react-hook-form"
import { TextInputField } from "components/text-input-field/text-input-field"
import {
  BackgroundStyle,
  CONTAINER,
  drawerErrorMessage,
  MainBackground,
  textInput,
} from "theme/elements"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import { getBalance, getFees, makeSendTransaction } from "services/api"
import { showMessage } from "react-native-flash-message"
import styles from "./styles"
import { boolean } from "mobx-state-tree/dist/internal"
import { offsets, presets } from "../../components/screen/screen.presets"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const SendScreen: FC<StackScreenProps<NavigatorParamList, "send">> = observer(
  function SendScreen({ route }) {
    // styling
    const DashboardStyle: ViewStyle = {
      ...ROOT,
    }

    const WALLET_STYLE: ViewStyle = {
      width: "100%",
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
    }

    const rewardsStyle: TextStyle = {
      color: color.palette.gold,
      fontSize: 10,
      lineHeight: 14,
      paddingVertical: spacing[2],
    }
    const amountStyle: TextStyle = {
      color: color.palette.white,
      fontSize: 27,
      lineHeight: 37,
    }

    const ALIGN_CENTER: ViewStyle = {
      alignItems: "center",
    }

    const DrawerStyle: ViewStyle = {
      display: "flex",
    }
    const SCROLL_VIEW_CONTAINER: ViewStyle = {
      flexGrow: 1,
      justifyContent: "space-between",
      backgroundColor: color.palette.black,
    }

    const walletLogo = require("../../../assets/images/avt.png")
    // Pull in one of our MST stores
    const { currentWalletStore, pendingTransactions, exchangeRates } = useStores()
    const { getAssetById } = currentWalletStore
    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
    } = useForm({ mode: "onChange" })

    const amount = useWatch({
      control,
      name: "amount",
      defaultValue: "",
    })
    const recipientAddress = useWatch({
      control,
      name: "recipientAddress",
      defaultValue: "",
    })

    const truncateRecipient = (hash: string) => {
      return hash.substring(0, 8) + "..." + hash.substring(hash.length - 8, hash.length)
    }

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const asset = getAssetById(route.params.coinId)
    const [fees, setFees] = useState<any>(null)
    const [isPreview, setIsPreview] = useState<boolean>(false)
    const [sending, setSending] = useState<boolean>(false)
    const [sendable, setSendable] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const { setBalance } = currentWalletStore

    useEffect(() => {
      // setBalance(asset, currentWalletStore.getBalance(asset))
      const _getBalances = async () => {
        const balance = await getBalance(asset)
        setBalance(asset, balance.confirmedBalance, balance.stakedBalance)
      }
      _getBalances()
    }, [])

    const onSubmit = async () => {
      setErrorMsg(null)
      try {
        setIsPreview(true)
        setSendable(false)
        const response = await getFees(asset, recipientAddress, amount)
        setFees(response)
        setSendable(true)
      } catch (error) {
        console.log(error)
        switch (error.message) {
          case "INSUFFICIENT_FUNDS":
            setErrorMsg("Insufficiant funds")
            break
          default:
            setErrorMsg(error.message)
            break
        }

        setSendable(false)
      }
    }

    const processTransaction = async () => {
      setSending(true)
      try {
        const txId = await makeSendTransaction(asset, fees ? fees.regular : null)
        if (!txId) {
          showMessage({ message: "Unable to Send", type: "danger" })
        } else {
          showMessage({ message: "Transaction sent", type: "success" })
          pendingTransactions.add(asset, {
            amount: `-${new BigNumber(amount)
              .plus(fees.regular.settings.feeValue ? fees.regular.settings.feeValue : "0")
              .toString()}`,
            from: asset.address,
            to: recipientAddress,
            timestamp: new Date().getTime(),
            reason: "transaction",
            txId,
          })
          setFees(null)
          setIsPreview(false)
          goBack()
        }
      } catch (err) {
        showMessage({ message: err.message, type: "danger" })
      } finally {
        setSending(false)
      }
    }

    const goBack = () => navigation.goBack()

    return (
      <Screen unsafe style={DashboardStyle} preset="fixed" backgroundColor={color.palette.black}>
        <ScrollView contentContainerStyle={SCROLL_VIEW_CONTAINER}  keyboardShouldPersistTaps={'handled'}>
          <KeyboardAvoidingView
            style={[presets.scroll.outer, { backgroundColor: color.palette.black }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={50}
          >
            <ImageBackground source={MainBackground} style={BackgroundStyle}>
              <View style={CONTAINER}>
                <View style={WALLET_STYLE}>
                  <CurrencyDescriptionBlock
                    icon="transfer"
                    asset={asset}
                    title="Available balance"
                  />
                </View>
                <View>
                  <Controller
                    control={control}
                    name="recipientAddress"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <TextInputField
                        name="recipientAddress"
                        style={textInput}
                        errors={errors}
                        label="Recipient's address"
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

                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <TextInputField
                        name="amount"
                        style={textInput}
                        errors={errors}
                        label="Amount"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(value) => onChange(value)}
                        keyboardType="numeric"
                        numberOfLines={1}
                        returnKeyType="done"
                      />
                    )}
                    rules={{
                      required: {
                        value: true,
                        message: "Field is required!",
                      },
                    }}
                  />
                </View>
                <View style={ALIGN_CENTER}>
                  <WalletButton
                    type="primary"
                    text="Preview the transfer"
                    outline={true}
                    disabled={!isValid}
                    onPress={()=>{
                      Keyboard.dismiss()
                      handleSubmit(onSubmit)()
                    }}
                  />
                </View>
              </View>
            </ImageBackground>
            {isPreview && (
              <Drawer
                title="Sign and Submit"
                style={DrawerStyle}
                actions={[
                  <Button
                    text="CANCEL"
                    style={styles.DRAWER_BTN_CANCEL}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    disabled={sending}
                    onPress={() => {
                      setIsPreview(false)
                    }}
                  />,
                  <Button
                    text={sending ? "SENDING..." : "SIGN AND SUBMIT"}
                    disabled={sending || !sendable}
                    style={styles.DRAWER_BTN_OK}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    onPress={processTransaction}
                  />,
                ]}
              >
                <View style={styles.DRAWER_CARD}>
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Transfer</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>{amount} {asset?.symbol.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.CARD_ITEM_DIVIDER} />
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Recipient</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>{truncateRecipient(recipientAddress)}</Text>
                    </View>
                  </View>
                  <View style={styles.CARD_ITEM_DIVIDER} />
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Transaction fees</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>
                        {fees ? `${fees.regular.settings.feeValue} ${fees.regular.currency}` : ""} {asset?.symbol.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                {errorMsg && <Text style={[drawerErrorMessage]}>{errorMsg}</Text>}
              </Drawer>
            )}

            <Footer onLeftButtonPress={goBack} />
          </KeyboardAvoidingView>
        </ScrollView>
      </Screen>
    )
  },
)
