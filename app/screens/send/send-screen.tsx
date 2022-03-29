import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageBackground, TextStyle, View, ViewStyle } from "react-native"
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
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Controller, useForm, useWatch } from "react-hook-form"
import { TextInputField } from "components/text-input-field/text-input-field"
import {
  BackgroundStyle,
  btnDefault,
  btnDisabled,
  CONTAINER,
  demoText,
  drawerErrorMessage,
  footBtn,
  MainBackground,
  PRIMARY_BTN,
  PRIMARY_TEXT,
  textInput,
  textInputErrorMessage,
} from "theme/elements"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import { getBalance, getFees, makeSendTransaction } from "services/api"
import { showMessage } from "react-native-flash-message"
import styles from "./styles"
import { boolean } from "mobx-state-tree/dist/internal"

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
    const walletLogo = require("../../../assets/images/avt.png")
    // Pull in one of our MST stores
    const { currentWalletStore, pendingTransactions } = useStores()
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
        setBalance(asset, balance)
      }
      _getBalances()
    }, [])

    const onSubmit = async () => {
      setErrorMsg(null)
      try {
        setIsPreview(true)
        setSendable(false)
        console.log("WILL GET FEESSSSSSSSSSSSSSSSS")
        const response = await getFees(asset, recipientAddress, amount)
        console.log("GOT FEESSSSSSSSSSSSSSSSSSS")
        setFees(response)
        setSendable(true)
      } catch (error) {
        console.log("Unable to get fees")
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
              .plus(fees.regular.settings.value ? fees.regular.settings.value : "0")
              .toString()}`,
            from: asset.address,
            to: recipientAddress,
            timestamp: new Date().getTime(),
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
      <Screen unsafe style={DashboardStyle} preset="fixed">
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <View style={CONTAINER}>
            <View style={WALLET_STYLE}>
              <CurrencyDescriptionBlock icon="transfer" asset={asset} title="Available balance" />
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
                onPress={handleSubmit(onSubmit)}
              ></WalletButton>
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
              ></Button>,
              <Button
                text={sending ? "SENDING..." : "SIGN AND SUBMIT"}
                disabled={sending || !sendable}
                style={styles.DRAWER_BTN_OK}
                textStyle={styles.DRAWER_BTN_TEXT}
                onPress={processTransaction}
              ></Button>,
            ]}
          >
            <View style={styles.DRAWER_CARD}>
              <View style={styles.DRAWER_CARD_ITEM}>
                <Text style={styles.CARD_ITEM_TITLE}>Transfer</Text>
                <View style={styles.CARD_ITEM_DESCRIPTION}>
                  <Text style={styles.AMOUNT_STYLE}>{amount}</Text>
                </View>
              </View>
              <View style={styles.CARD_ITEM_DIVIDER}></View>
              <View style={styles.DRAWER_CARD_ITEM}>
                <Text style={styles.CARD_ITEM_TITLE}>Recipient</Text>
                <View style={styles.CARD_ITEM_DESCRIPTION}>
                  <Text style={styles.AMOUNT_STYLE}>{truncateRecipient(recipientAddress)}</Text>
                </View>
              </View>
              <View style={styles.CARD_ITEM_DIVIDER}></View>
              <View style={styles.DRAWER_CARD_ITEM}>
                <Text style={styles.CARD_ITEM_TITLE}>Transaction fees</Text>
                <View style={styles.CARD_ITEM_DESCRIPTION}>
                  <Text style={styles.AMOUNT_STYLE}>
                    {fees ? `${fees.regular.settings.value} ${fees.regular.currency}` : "Unknown"}
                  </Text>
                  {/* <Text style={styles.AMOUNT_SUB_STYLE}>0.23 available</Text> */}
                </View>
              </View>
            </View>
            {errorMsg && <Text style={[drawerErrorMessage]}>{errorMsg}</Text>}
          </Drawer>
        )}

        <Footer onLeftButtonPress={goBack}></Footer>
      </Screen>
    )
  },
)
