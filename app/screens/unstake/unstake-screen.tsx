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
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import BigNumber from "bignumber.js"

import {
  Button,
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
import { getBalance, getFees, makeUnstakeTransaction } from "services/api"
import { showMessage } from "react-native-flash-message"
import styles from "./styles"
import { boolean } from "mobx-state-tree/dist/internal"
import { offsets, presets } from "../../components/screen/screen.presets"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const UnstakeScreen: FC<StackScreenProps<NavigatorParamList, "unstake">> = observer(
  function UnstakeScreen({ route }) {
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
    const recipientAddress = useWatch({
      control,
      name: "recipientAddress",
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
    const [unstakeing, setUnstakeing] = useState<boolean>(false)
    const [unstakeable, setUnstakeable] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const { setBalance } = currentWalletStore

    useEffect(() => {
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
        setUnstakeable(false)
        const response = await getFees(asset, recipientAddress, amount, "staking")
        setFees(response)
        setUnstakeable(true)
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

        setUnstakeable(false)
      }
    }

    useEffect(() => {
      // Percentage changed, adjust the amount to be unstaked
      const amount = (asset.balance * percentage) / 100
      setValue(
        "amount",
        `${percentage === 100 ? `${asset.balance}` : parseFloat(amount.toFixed(4))}`,
        { shouldValidate: true },
      )
    }, [percentage])

    const processTransaction = async () => {
      setUnstakeing(true)
      try {
        const txId = await makeUnstakeTransaction(asset, fees ? fees.regular : null)
        if (!txId) {
          showMessage({ message: "Unable to Unstake", type: "danger" })
        } else {
          showMessage({ message: "Transaction sent", type: "success" })
          pendingTransactions.add(asset, {
            amount: `-${new BigNumber(amount)
              .plus(fees.regular.settings.feeValue ? fees.regular.settings.feeValue : "0")
              .toString()}`,
            from: asset.address,
            to: recipientAddress,
            timestamp: new Date().getTime(),
            reason: "unstaking",
            txId,
          })
          setFees(null)
          setIsPreview(false)
          goBack()
        }
      } catch (err) {
        showMessage({ message: err.message, type: "danger" })
      } finally {
        setUnstakeing(false)
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
                  <CurrencyDescriptionBlock
                    icon="unstake"
                    asset={asset}
                    title="Available balance"
                  />
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
                        label={`Number of ${asset.symbol} to unstake`}
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
                </View>

                <View style={ALIGN_CENTER}>
                  <WalletButton
                    type="primary"
                    text="Preview the unstaking"
                    outline={true}
                    disabled={!isValid}
                    onPress={handleSubmit(onSubmit)}
                  />
                </View>
              </View>
            </ImageBackground>
            {isPreview && (
              <Drawer
                title="Resume of your unstaking"
                style={DrawerStyle}
                actions={[
                  <Button
                    text="CANCEL"
                    style={styles.DRAWER_BTN_CANCEL}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    disabled={unstakeing}
                    onPress={() => {
                      setIsPreview(false)
                    }}
                  />,
                  <Button
                    text={unstakeing ? "SENDING..." : "SIGN AND SUBMIT"}
                    disabled={unstakeing || !unstakeable}
                    style={styles.DRAWER_BTN_OK}
                    textStyle={styles.DRAWER_BTN_TEXT}
                    onPress={processTransaction}
                  />,
                ]}
              >
                <View style={styles.DRAWER_CARD}>
                  <View style={styles.DRAWER_CARD_ITEM}>
                    <Text style={styles.CARD_ITEM_TITLE}>Amount to unstake</Text>
                    <View style={styles.CARD_ITEM_DESCRIPTION}>
                      <Text style={styles.AMOUNT_STYLE}>{amount}</Text>
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
