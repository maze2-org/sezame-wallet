import React, { FC, useRef, useEffect, useState, useCallback } from "react"
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
  StyleSheet, TextInputProps, ViewProps, TextInput, Pressable, Dimensions,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "navigators"
import BigNumber from "bignumber.js"

import {
  Text,
  Button,
  Drawer,
  Footer,
  Screen,
  WalletButton,
  CurrencyDescriptionBlock,
} from "components"

import { color, spacing, typography } from "theme"
import { Controller, useForm, useWatch } from "react-hook-form"
import { TextInputField } from "components/text-input-field/text-input-field"
import {
  textInput,
  CONTAINER,
  MainBackground,
  BackgroundStyle,
  drawerErrorMessage, PRIMARY_BTN, textInputErrorMessage,
} from "theme/elements"
import { useNavigation } from "@react-navigation/native"
import { BaseWalletDescription, useStores } from "models"
import { getBalance, getFees } from "services/api"
import styles from "./styles"
import { presets } from "components/screen/screen.presets"
import { CONFIG, Chains, NodeProviderGenerator } from "@maze2/sezame-sdk"

import {
  transferLocalTokenFromAlph,
  CHAIN_ID_ETH,
  MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
} from "@alephium/wormhole-sdk"

import * as alephiumMainnetConfig from "../../bridges/alephium/artifacts/.deployments.mainnet.json"
import { PrivateKeyWallet } from "@alephium/web3-wallet"
import { ALPH_TOKEN_ID, NodeProvider, ONE_ALPH } from "@alephium/web3"
import { BridgeSettings } from "@maze2/sezame-sdk/dist/utils/config"
import { showMessage } from "react-native-flash-message"
import { palette } from "theme/palette.ts"
import handCoinIcon from "assets/icons/hand-coin.svg"
import { SvgXml } from "react-native-svg"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

type BridgeDetails = {
  nodeProvider?: NodeProvider | null;
  signer?: PrivateKeyWallet | null;
  bridgeConfig?: BridgeSettings | null;
};

const checkboxes = [
  { value: 1, title: "25%" },
  { value: 2, title: "50%" },
  { value: 3, title: "75%" },
]

export const BridgeScreen: FC<StackScreenProps<NavigatorParamList, "bridge">> =
  observer(function BridgeScreen({ route }) {

    const DrawerStyle: ViewStyle = {
      display: "flex",
    }

    // Pull in one of our MST stores
    const { currentWalletStore, pendingTransactions, exchangeRates } =
      useStores()
    const { getSelectedAddressForAsset, assets } = currentWalletStore
    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
    } = useForm({
      mode: "onChange",
      defaultValues: {
        amount: "",
        checkbox: null,
      },
    })

    const textInputAmount = useWatch({
      control,
      name: "amount",
      defaultValue: "",
    })

    const checkboxFiled = useWatch({
      control,
      name: "checkbox",
    })

    const scrollViewRef = useRef<ScrollView | null>(null)
    const [bridgeDetails, setBridgeDetails] = useState<BridgeDetails>({
      nodeProvider: null,
      signer: null,
      bridgeConfig: null,
    })

    const transferToBridge = async (amount: number) => {
      if (!asset || !amount) {
        return
      }

      const nodeProvider = await NodeProviderGenerator.getNodeProvider(
        asset.chain as Chains,
      )

      const wallet = new PrivateKeyWallet({
        privateKey: asset.privateKey,
        nodeProvider,
      })

      const bridgeConfig: BridgeSettings | null =
        (CONFIG.getConfigFor(asset.chain, "bridge") as BridgeSettings) || null

      if (!bridgeConfig) {
        return false
      }
      const bAmount = BigInt(Number(amount) * 1000000000000000000)

      try {
        console.log("MESSAGEFEEEEEEEEEEEEEEEE", bridgeConfig.config.messageFee)
        const result = await transferLocalTokenFromAlph(
          wallet,
          alephiumMainnetConfig.contracts.TokenBridge.contractInstance
            .contractId,
          wallet.account.address,
          ALPH_TOKEN_ID,
          CHAIN_ID_ETH,
          bridgeConfig.config.contracts.nativeTokenBridge,
          bAmount,
          BigInt(bridgeConfig.config.messageFee),
          0n,
          MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
        )

        console.log("result", { result })
      } catch (err) {
        console.log("THERE WAS AN ERROR IN transferLocalTokenFromAlph", err)
      } finally {
        console.log("Done...")
      }

      console.log("TRANSFER DONEEEEEEEEEEEEE")

      // console.log({result});
    }

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const asset = getSelectedAddressForAsset(
      route.params.coinId,
      route.params.chain,
    )
    const [fees, setFees] = useState<any>(null)
    const [isPreview, setIsPreview] = useState<boolean>(false)
    const [sending, setSending] = useState<boolean>(false)
    const [sendable, setSendable] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [amount, setAmount] = useState<number | null>(0)
    const numericRegEx = useRef(/^\d+(.\d+)?$/).current
    const { setBalance } = currentWalletStore

    useEffect(() => {
      const _getBalances = async () => {
        if (asset) {
          const balance = await getBalance(asset)
          setBalance(asset, balance)
        }
      }
      _getBalances()
    }, [])

    useEffect(() => {
      // Convert the string got from the form into a number (Sdk needs a number and not a string)
      setAmount(parseFloat(textInputAmount.split(",").join(".")))
    }, [textInputAmount])

    useEffect(() => {
      console.log("checkboxFiled", checkboxFiled)
    }, [checkboxFiled])

    const init = useCallback(async (asset: BaseWalletDescription) => {
      const nodeProvider = await NodeProviderGenerator.getNodeProvider(
        asset.chain as Chains,
      )

      const signer = new PrivateKeyWallet({
        privateKey: asset.privateKey,
        nodeProvider,
      })

      const bridgeConfig =
        (CONFIG?.getConfigFor &&
          (CONFIG.getConfigFor(
            asset.chain as Chains,
            "bridge",
          ) as BridgeSettings)) ||
        null

      console.log("Define provider")
      setBridgeDetails({ nodeProvider, signer, bridgeConfig })
    }, [])

    useEffect(() => {
      if (asset) {
        init(asset)
      }
    }, [asset?.address, asset?.chain, init])

    const truncateRecipient = (hash: string) => {
      return (
        hash.substring(0, 8) +
        "..." +
        hash.substring(hash.length - 8, hash.length)
      )
    }

    const onSubmit = async () => {
      setErrorMsg(null)
      try {
        if (!asset || amount === null) {
          return
        }

        const { bridgeConfig } = bridgeDetails

        if (!bridgeConfig) {
          return
        }

        setIsPreview(true)
        setSendable(false)
        const response = await getFees(
          asset,
          bridgeConfig.config.contracts.nativeTokenBridge,
          amount,
          "bridge",
        )
        console.log(response)
        setFees(response)
        console.log("SUBMITTING ---------------------->", { asset, amount })
        // transferToBridge(amount);
        setSendable(true)
      } catch (error: any) {
        console.log("THERE IS AN ERROR IN THE TRANSFER")
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
      if (!asset) {
        return
      }

      if (!amount) {
        return
      }

      setSending(true)
      try {
        transferToBridge(amount)
        // const txId = await makeSendTransaction(
        //   asset,
        //   fees ? fees.regular : null,
        // );
        // if (!txId) {
        //   showMessage({message: 'Unable to Send', type: 'danger'});
        // } else {
        //   if (amount === null) {
        //     showMessage({message: 'No amount specified', type: 'danger'});
        //     return;
        //   }
        //   showMessage({message: 'Transaction sent', type: 'success'});
        //   pendingTransactions.add(asset, {
        //     amount: `-${new BigNumber(amount)
        //       .plus(
        //         fees.regular.settings.feeValue
        //           ? fees.regular.settings.feeValue
        //           : '0',
        //       )
        //       .toString()}`,
        //     from: asset.address,
        //     to: recipientAddress,
        //     timestamp: new Date().getTime(),
        //     reason: 'transaction',
        //     txId,
        //   });
        setFees(null)
        setIsPreview(false)
        goBack()
        // }
      } catch (err: any) {
        showMessage({ message: err.message, type: "danger" })
      } finally {
        setSending(false)
      }
    }

    // const validAddress = address => {
    //   return checkAddress(address, asset.chain as any) || 'Invalid address';
    // };

    const goBack = () => navigation.goBack()

    const onPressGoAddEthereum = () => {
      /** TODO correct path **/
      // navigation.navigate('createWallet');
    }

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
        scrollViewRef?.current?.scrollToEnd()
      })
      return () => keyboardDidShowListener.remove()
    }, [scrollViewRef?.current])

    return (
      <KeyboardAvoidingView
        style={[
          presets.scroll.outer,
          { backgroundColor: color.palette.black },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <ScrollView contentContainerStyle={stylesComponent.container} keyboardShouldPersistTaps={"handled"}>
            <View>

              <View style={stylesComponent.walletsWrapper}>
                <CurrencyDescriptionBlock
                  icon="transfer"
                  balance="freeBalance"
                  asset={asset}
                  title="Available balance"
                />
                <CurrencyDescriptionBlock
                  icon="transfer"
                  balance="freeBalance"
                  asset={asset}
                  title="Available balance"
                />
              </View>

              <View style={[stylesComponent.infoCard, { marginTop: 24 }]}>
                <Text style={stylesComponent.infoCardTitle}>Important</Text>
                <Text style={stylesComponent.infoCardMessage}>
                  You need to add Ethereum (and its ALPH ERC20 token) to your wallet before performing bridge
                  operations
                </Text>
              </View>

              {/*<View style={[stylesComponent.infoCard,stylesComponent.infoCardGold,{marginTop:24}]}>*/}
              {/*  <Text style={stylesComponent.infoCardTitle}>Important</Text>*/}
              {/*  <Text style={stylesComponent.infoCardMessage}>*/}
              {/*    You don’t have any funds in your Ethereum wallet.*/}
              {/*    Note that you will have to pay ethereum transaction fees and you will need some ETH to finalize the process*/}
              {/*  </Text>*/}
              {/*</View>*/}

              <Button
                style={PRIMARY_BTN}
                textStyle={{ color: palette.white }}
                text="Add Ethereum network to the wallet"
                onPress={onPressGoAddEthereum}
              />


              <View>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <View style={stylesComponent.labelWrapper}>
                      <Text style={stylesComponent.label}>Amount to bridge</Text>
                      <View style={stylesComponent.inputFiledWrapper}>
                        <TextInput style={stylesComponent.inputFiled} returnKeyType={"done"} numberOfLines={1}
                                   keyboardType="numeric" onBlur={onBlur} value={value} onChangeText={onChange} />
                        <SvgXml style={stylesComponent.inputIcon} width="28" height="28" xml={handCoinIcon} />
                      </View>
                    </View>
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: "Field is required!",
                    },
                    pattern: {
                      value: numericRegEx,
                      message: "Invalid amount",
                    },
                    max: {
                      value: asset?.freeBalance,
                      message: "Insufficient funds",
                    },
                  }}
                />
                {errors?.["amount"]?.message &&
                  <Text style={textInputErrorMessage}>{errors["amount"].message}</Text>
                }
              </View>

              <View style={stylesComponent.checkboxes}>
                {checkboxes.map((el) => {
                  return (
                    <Controller
                      control={control}
                      name="checkbox"
                      render={({ field: { onChange, value } }) => {
                        const cond = value !== null && +value === +el.value
                        return (
                          <Pressable
                            style={[stylesComponent.checkbox, cond && stylesComponent.checkboxActive]}
                            key={el.value} onPress={() => onChange(cond ? null : el.value)}>
                            <Text style={stylesComponent.checkboxText}>{el.title}</Text>
                          </Pressable>
                        )
                      }}
                    />
                  )
                })}
              </View>
            </View>

          </ScrollView>
          <View style={stylesComponent.previewOperation}>
            <WalletButton
              type="primary"
              text="Preview the operation"
              outline={true}
              disabled={!isValid}
              onPress={() => {
                Keyboard.dismiss()
                handleSubmit(onSubmit)()
              }}
            />
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
            ]}>
            <View style={styles.DRAWER_CARD}>
              <View style={styles.DRAWER_CARD_ITEM}>
                <Text style={styles.CARD_ITEM_TITLE}>Transfer</Text>
                <View style={styles.CARD_ITEM_DESCRIPTION}>
                  <Text style={styles.AMOUNT_STYLE}>
                    {amount} {asset?.symbol.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.CARD_ITEM_DIVIDER} />
              <View style={styles.DRAWER_CARD_ITEM}>
                <Text style={styles.CARD_ITEM_TITLE}>Recipient</Text>
                <View style={styles.CARD_ITEM_DESCRIPTION}>
                  <Text style={styles.AMOUNT_STYLE}>
                    {truncateRecipient(
                      `${bridgeDetails.bridgeConfig?.config.contracts.nativeTokenBridge}`,
                    )}
                  </Text>
                </View>
              </View>
              <View style={styles.CARD_ITEM_DIVIDER} />
              <View style={styles.DRAWER_CARD_ITEM}>
                <Text style={styles.CARD_ITEM_TITLE}>Transaction fees</Text>
                <View style={styles.CARD_ITEM_DESCRIPTION}>
                  <Text style={styles.AMOUNT_STYLE}>
                    {fees && (
                      <>
                        {fees
                          ? `${fees.regular.settings.feeValue.toFixed(6)} ${
                            fees.regular.currency
                          }`
                          : ""}{" "}
                        <Text style={styles.EQUIVALENT_USD_STYLE}>
                          (~
                          {`${(
                            exchangeRates.getRate(asset.cid) *
                            fees.regular.settings.feeValue
                          ).toFixed(2)}`}
                          $)
                        </Text>
                      </>
                    )}
                  </Text>
                </View>
              </View>
            </View>
            {errorMsg && (
              <Text style={[drawerErrorMessage]}>{errorMsg}</Text>
            )}
          </Drawer>
        )}

        <Footer onLeftButtonPress={goBack}/>
      </KeyboardAvoidingView>
    )
  })


const stylesComponent = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: spacing[5],
  },
  walletsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoCard: {
    gap: 16,
    width: "100%",
    borderRadius: 6,
    marginBottom: 35,
    paddingVertical: 19,
    paddingHorizontal: 8,
    backgroundColor: palette.darkBlack,
  },
  infoCardGold: {
    backgroundColor: "#DBAF00",
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.white,
  },
  infoCardMessage: {
    fontSize: 14,
    color: palette.white,
  },
  inputFiledWrapper: {
    position: "relative",
  },
  inputFiled: {
    fontSize: 16,
    width: "100%",
    color: palette.white,
    backgroundColor: palette.darkBlack,
    borderRadius: 8,
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 35,
  },
  labelWrapper: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    color: color.palette.grey,
    textTransform: "uppercase",
    fontFamily: typography.primary,
  },
  inputIcon: {
    position: "absolute",
    right: 5,
    top: 10,
  },
  checkboxes: {
    gap: 10,
    marginTop: 20,
    flexDirection: "row",
    width: Dimensions.get("screen").width - 60,
  },
  checkbox: {
    paddingVertical: 4,
    width: "33.3%",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.darkBlack,
  },
  checkboxText: {
    fontSize: 14,
    color: palette.white,
  },
  checkboxActive: {
    backgroundColor: "#DBAF00",
  },
  previewOperation: {
    marginTop: 29,
    marginBottom:16,
    alignItems: "center",
  },
})
