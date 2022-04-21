import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  ImageBackground,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import BigNumber from "bignumber.js"

import {
  Button,
  Checkbox,
  CurrencyDescriptionBlock,
  Drawer,
  Footer,
  PercentageSelector,
  Screen,
  Text,
  WalletButton,
} from "../../components"

import { color, spacing } from "../../theme"
import { Controller, useForm, useWatch } from "react-hook-form"
import { TextInputField } from "components/text-input-field/text-input-field"
import { BackgroundStyle, CONTAINER, drawerErrorMessage, MainBackground } from "theme/elements"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import { getBalance, getFees, makeSwapTransaction } from "services/api"
import { showMessage } from "react-native-flash-message"
import styles from "./styles"
import { presets } from "../../components/screen/screen.presets"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const SwapScreen: FC<StackScreenProps<NavigatorParamList, "swap">> = observer(
  function SwapScreen({ route }) {
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

    // Pull in one of our MST stores
    const { currentWalletStore, pendingTransactions, exchangeRates } = useStores()
    const { getAssetById } = currentWalletStore
    const {
      control,
      handleSubmit,
      setValue,
      formState: { errors, isValid },
    } = useForm({ mode: "onChange" })

    const amount = useWatch({
      control,
      name: "amount",
      defaultValue: "",
    })

    const percentage = useWatch({
      control,
      name: "percentage",
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
    const [swaping, setSwaping] = useState<boolean>(false)
    const [swapable, setSwapable] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const { setBalance } = currentWalletStore

    const [recipientAddress, setRecipientAddress] = useState<string>("")

    useEffect(() => {
      const _getBalances = async () => {
        const balance = await getBalance(asset)
        setBalance(asset, balance.confirmedBalance, balance.stakedBalance)
      }
      _getBalances()

      // Get the recipient address
      setRecipientAddress(currentWalletStore.getWalletAddressByChain(route.params.swapToChain))
    }, [])

    const onSubmit = async () => {
      setErrorMsg(null)
      try {
        setIsPreview(true)
        setSwapable(false)
        const response = await getFees(asset, recipientAddress, amount, route.params.swapType)
        setFees(response)
        setSwapable(true)
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

        setSwapable(false)
      }
    }

    useEffect(() => {
      // Percentage changed, adjust the amount to be swapd
      const amount = (asset.balance * percentage) / 100
      setValue(
        "amount",
        `${percentage === 100 ? `${asset.balance}` : parseFloat(amount.toFixed(4))}`,
        { shouldValidate: true },
      )
    }, [percentage])

    const processTransaction = async () => {
      setSwaping(true)
      try {
        const txId = await makeSwapTransaction(
          asset,
          fees ? fees.regular : null,
          route.params.swapType,
        )
        if (!txId) {
          showMessage({ message: "Unable to Swap", type: "danger" })
        } else {
          showMessage({ message: "Swaping request done", type: "success" })
          pendingTransactions.add(asset, {
            amount: `${new BigNumber(amount)
              .plus(fees.regular.settings.feeValue ? fees.regular.settings.feeValue : "0")
              .toString()}`,
            from: asset.address,
            to: recipientAddress,
            timestamp: new Date().getTime(),
            reason: route.params.swapType,
            txId,
          })
          setFees(null)
          setIsPreview(false)
          goBack()
        }
      } catch (err) {
        showMessage({ message: err.message, type: "danger" })
      } finally {
        setSwaping(false)
      }
    }

    const goBack = () => navigation.goBack()

    return (
      <Screen unsafe style={DashboardStyle} preset="fixed" backgroundColor={color.palette.black}>
        <ScrollView contentContainerStyle={SCROLL_VIEW_CONTAINER}>
          <KeyboardAvoidingView
            style={[presets.scroll.outer, { backgroundColor: color.palette.black }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={50}
          >
            <ImageBackground source={MainBackground} style={BackgroundStyle}>
              <View style={CONTAINER}>
                <View style={WALLET_STYLE}>
                  <CurrencyDescriptionBlock icon="swap" asset={asset} title="Available balance" />
                </View>
                <View>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <TextInputField
                        name="amount"
                        fieldStyle="alt"
                        errors={errors}
                        label={`Number of ${asset.symbol} to swap to ${route.params.swapToChain} network`}
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
                      min: {
                        value: 0.00000001,
                        message: "Not enough tokens",
                      },
                    }}
                  />

                  <Controller
                    control={control}
                    name="percentage"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <PercentageSelector value={value} onChange={(value) => onChange(value)} />
                    )}
                  ></Controller>
                  <Controller
                    control={control}
                    name="cgu"
                    rules={{
                      required: {
                        value: true,
                        message: "Please accept the terms and conditions",
                      },
                    }}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <Checkbox
                        text={
                          <View>
                            <Text style={{ paddingHorizontal: spacing[1] }}>
                              <Text>I have read the </Text>
                              <Text
                                onPress={() => Linking.openURL("https://www.aventus.io/")}
                                style={styles.URL}
                              >
                                terms and conditions
                              </Text>
                            </Text>
                          </View>
                        }
                        value={value}
                        onToggle={(value) => onChange(value)}
                      />
                    )}
                  ></Controller>
                </View>

                <View style={ALIGN_CENTER}>
                  <WalletButton
                    type="primary"
                    text="Preview the swap"
                    outline={true}
                    disabled={!isValid}
                    onPress={handleSubmit(onSubmit)}
                  />
                </View>
              </View>
            </ImageBackground>
            {isPreview && (
              <Drawer
                title="Summarize of your swap"
                style={DrawerStyle}
                actions={[
                  <Button
                    text="CANCEL"
                    style={styles.DRAWER_BTN_CANCEL}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    disabled={swaping}
                    onPress={() => {
                      setIsPreview(false)
                    }}
                  />,
                  <Button
                    text={swaping ? "SENDING..." : "SIGN AND SUBMIT"}
                    disabled={swaping || !swapable}
                    style={styles.DRAWER_BTN_OK}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    onPress={processTransaction}
                  />,
                ]}
              >
                <View style={styles.DRAWER_CARD}>
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Amount to swap</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>{amount}</Text>
                    </View>
                  </View>
                  <View style={styles.CARD_ITEM_DIVIDER} />
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Recipient address</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>{truncateRecipient(recipientAddress)}</Text>
                    </View>
                  </View>
                  <View style={styles.CARD_ITEM_DIVIDER} />
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Transaction fees</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>
                        {fees ? `${fees.regular.settings.feeValue} ${fees.regular.currency}` : ""}
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
