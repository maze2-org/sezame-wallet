import React, { FC, useRef, useEffect, useState, useCallback, useMemo } from "react"
import AlephimPendingBride from "components/alephimPendingBride/alephimPendingBride.tsx"
import Clipboard from "@react-native-clipboard/clipboard"
import handCoinIcon from "assets/icons/hand-coin.svg"
import { grpc } from "@improbable-eng/grpc-web"
import { ReactNativeTransport } from "@improbable-eng/grpc-web-react-native-transport"
import { ethers } from "ethers"
import { SvgXml } from "react-native-svg"
import { presets } from "components/screen/screen.presets"
import { palette } from "theme/palette.ts"
import { observer } from "mobx-react-lite"
import { arrayify } from "@ethersproject/bytes"
import { atob, btoa } from "react-native-quick-base64"
import FlashMessage, { showMessage } from "react-native-flash-message"
import { useNavigation } from "@react-navigation/native"
import { BridgeSettings } from "@maze2/sezame-sdk/dist/utils/config"
import { PrivateKeyWallet } from "@alephium/web3-wallet"
import { NavigatorParamList } from "navigators"
import { getBalance, getFees } from "services/api"
import { color, spacing, typography } from "theme"
import { Controller, useForm, useWatch } from "react-hook-form"
import { BaseWalletDescription, useStores } from "models"
import { CONFIG, Chains, NodeProviderGenerator } from "@maze2/sezame-sdk"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import {
  PRIMARY_BTN,
  MainBackground,
  BackgroundStyle,
  drawerErrorMessage,
  textInputErrorMessage,
} from "theme/elements"
import {
  web3,
  node,
  NodeProvider,
  ALPH_TOKEN_ID,
} from "@alephium/web3"
import {
  Text,
  Footer,
  Button,
  Drawer,
  WalletButton,
  CurrencyDescriptionBlock,
} from "components"
import {
  View,
  Keyboard,
  Platform,
  ViewStyle,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native"
import {
  redeemOnEth,
  CHAIN_ID_ETH,
  uint8ArrayToHex,
  CHAIN_ID_ALEPHIUM,
  waitAlphTxConfirmed,
  parseSequenceFromLogAlph,
  transferLocalTokenFromAlph,
  parseTargetChainFromLogAlph, ethers_contracts,
} from "@alephium/wormhole-sdk"

import styles from "./styles"
import RedeemCoins from "components/redeemCoins/redeemCoins.tsx"
import alephiumBridgeStore from "../../mobx/alephiumBridgeStore.tsx"
import { AlphTxInfo } from "screens/bridge/AlphTxInfo.ts"
import { getSignedVAAWithRetry } from "screens/bridge/getSignedVAAWithRetry.ts"
import { getConfigs, WormholeMessageEventIndex, ALPH_DECIMAL } from "./constsnts.ts"

global.atob = atob
global.btoa = btoa
grpc.setDefaultTransport(ReactNativeTransport({ withCredentials: true }))

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
  { value: 1, title: "25%", percent: 25 },
  { value: 2, title: "50%", percent: 50 },
  { value: 3, title: "75%", percent: 75 },
]

const tokens = require("@config/tokens.json")

export const BridgeScreen: FC<StackScreenProps<NavigatorParamList, "bridge">> =
  observer(function BridgeScreen({ route }) {
    const modalFlashRef = useRef<FlashMessage>()
    const rootStore = useStores()
    const BRIDGE_CONSTANTS = useMemo(() => (getConfigs(rootStore.TESTNET ? "testnet" : "mainnet")), [rootStore.TESTNET])

    const DrawerStyle: ViewStyle = {
      display: "flex",
    }

    // Pull in one of our MST stores
    const { currentWalletStore, pendingTransactions, exchangeRates } =
      useStores()
    const { getSelectedAddressForAsset, assets, wallet } = currentWalletStore
    const ethNetworkETHCoin = useMemo(() => assets.find((el) => el.chain === "ETH" && el.cid === "ethereum"), [assets.length])
    const ethNetworkAlephiumCoin = useMemo(() => assets.find((el) => el.chain === "ETH" && el.cid === "alephium"), [assets.length])
    console.log(wallet)

    const {
      control,
      handleSubmit,
      watch,
      setValue: setFormValue,
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

      const generator = await NodeProviderGenerator.getNodeProvider(
        asset.chain as Chains,
      )
      // @ts-ignore
      const nodeProvider: NodeProvider = generator.getNodeProvider()
      web3.setCurrentNodeProvider(nodeProvider)

      const wallet = new PrivateKeyWallet({
        privateKey: asset.privateKey,
        nodeProvider,
      })

      const bridgeConfig: BridgeSettings | null =
        // @ts-ignore
        (CONFIG.getConfigFor(asset.chain, "bridge") as BridgeSettings) || null

      if (!bridgeConfig) {
        return false
      }
      const bAmount = BigInt(Number(amount) * ALPH_DECIMAL)
      alephiumBridgeStore.setBridgingAmount(amount)
      try {
        console.log("MESSAGEFEEEEEEEEEEEEEEEE", bridgeConfig.config.messageFee)

        async function getTxInfo(provider: NodeProvider, txId: string) {
          console.log("CALL getTxInfo txID:", txId)
          const events = await provider.events.getEventsTxIdTxid(txId, { group: BRIDGE_CONSTANTS.ALEPHIUM_BRIDGE_GROUP_INDEX })
          console.log(events)
          const event = events.events.find((event) => event.contractAddress === BRIDGE_CONSTANTS.ALEPHIUM_BRIDGE_ADDRESS)
          if (typeof event === "undefined") {
            return Promise.reject(`Failed to get event for tx: ${txId}`)
          }
          if (event.eventIndex !== WormholeMessageEventIndex) {
            return Promise.reject("invalid event index: " + event.eventIndex)
          }
          const sender = event.fields[0]
          if (sender.type !== "ByteVec") {
            return Promise.reject("invalid sender, expect ByteVec type, have: " + sender.type)
          }
          const senderContractId = (sender as node.ValByteVec).value
          if (senderContractId !== BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID) {
            return Promise.reject("invalid sender, expect token bridge contract id, have: " + senderContractId)
          }
          const sequence = parseSequenceFromLogAlph(event)
          const targetChain = parseTargetChainFromLogAlph(event)
          return { sequence, targetChain }
        }

        async function waitTxConfirmedAndGetTxInfo(provider: NodeProvider, txId: string): Promise<AlphTxInfo> {
          const confirmed = await waitAlphTxConfirmed(provider, txId, 1)
          const { sequence, targetChain } = await getTxInfo(provider, txId)
          const blockHeader = await provider.blockflow.getBlockflowHeadersBlockHash(confirmed.blockHash)
          return new AlphTxInfo(blockHeader, txId, sequence, targetChain, confirmed.chainConfirmations)
        }

        const ethNodeProvider = new ethers.providers.JsonRpcProvider(BRIDGE_CONSTANTS.ETH_JSON_RPC_PROVIDER_URL)
        const signer = new ethers.Wallet(ethNetworkETHCoin!.privateKey, ethNodeProvider)
        alephiumBridgeStore.setSigner(signer)
        alephiumBridgeStore.setIsTransferring(true)

        const result = await transferLocalTokenFromAlph(
          wallet,
          BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID,
          wallet.account.address,
          ALPH_TOKEN_ID,
          CHAIN_ID_ETH,
          uint8ArrayToHex(arrayify(ethNetworkETHCoin!.address)),
          bAmount,
          BigInt(bridgeConfig.config.messageFee),
          0n,
          BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL,
        )

        console.log("result", result)

        const txInfo = await waitTxConfirmedAndGetTxInfo(wallet.nodeProvider, result.txId)
        alephiumBridgeStore.setIsTransferring(false)

        console.log("txInfo", txInfo)

        alephiumBridgeStore.setCurrentTxId(txInfo.txId)
        alephiumBridgeStore.setIsProcessingConfirmations(true)

        const interval = setInterval(async () => {
          const txStatus = await nodeProvider.transactions.getTransactionsStatus({ txId: txInfo.txId })
          if ("chainConfirmations" in txStatus) {
            alephiumBridgeStore.setCurrentConfirmations(txStatus.chainConfirmations)
          }
          if (alephiumBridgeStore.chainConfirmations >= BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL) {
            alephiumBridgeStore.setIsProcessingConfirmations(false)
            clearInterval(interval)
          }
        }, 10000)

        alephiumBridgeStore.setLoadingSignedVAA(true)
        console.log("waitAlphTxConfirmed [start]", BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)
        await waitAlphTxConfirmed(wallet.nodeProvider, txInfo.txId, BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)
        console.log("waitAlphTxConfirmed [end]", BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)

        console.log("getSignedVAA [start]")
        // signedVAA = vaaBytes
        const { vaaBytes } = await getSignedVAAWithRetry(
          BRIDGE_CONSTANTS.WORMHOLE_RPC_HOSTS,
          CHAIN_ID_ALEPHIUM,
          BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID,
          CHAIN_ID_ETH,
          txInfo.sequence,
        )
        alephiumBridgeStore.setLoadingSignedVAA(false)
        alephiumBridgeStore.setSignedVAA(vaaBytes)
        console.log("getSignedVAA [end]")
        console.log("vaaBytes", vaaBytes)

        const token = ethers_contracts.Bridge__factory.connect(BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS, signer)
        const gasAmountResult = await token.estimateGas.completeTransfer(vaaBytes)
        const gasAmount = Number(gasAmountResult.toString())
        const gasPrice: number = Number(result.gasPrice)
        const totalFee: number = gasAmount * gasPrice / 1e18
        alephiumBridgeStore.setTotalFees(totalFee)
      } catch (err) {
        console.log("THERE WAS AN ERROR IN transferLocalTokenFromAlph", err)
      } finally {
        console.log("Done...")
      }

      console.log("TRANSFER DONEEEEEEEEEEEEE")
    }

    const redeemOnEthHandler = async () => {
      const signer = alephiumBridgeStore.signer
      const signedVAA = alephiumBridgeStore.signedVAA
      setIsPreview(false)
      if (!signer || !signedVAA) return
      try {
        alephiumBridgeStore.setIsRedeemProcessing(true)
        const redeemData = await redeemOnEth(
          BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS,
          signer,
          signedVAA,
        )
        alephiumBridgeStore.resetStore()
        console.log("redeemData", redeemData)
      } catch (e) {
        console.log("redeemOnEthError: Something whet wrong ", e)
      } finally {
        alephiumBridgeStore.setIsRedeemProcessing(false)
      }
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
        setFees(null)
        setIsPreview(false)
        goBack()
      } catch (err: any) {
        showMessage({ message: err.message, type: "danger" })
      } finally {
        setSending(false)
      }
    }

    const goBack = () => navigation.goBack()

    const onPressGoAddEthereum = () => {
      const ALPHTokenInfo = tokens.find((el: any) => el.id === "alephium")
      const ALPHChain = ALPHTokenInfo.chains.find((el: any) => el.id === "ETH")
      const ETHTokenInfo = tokens.find((el: any) => el.id === "ethereum")
      const ETHChain = ETHTokenInfo.chains.find((el: any) => el.id === "ETH")

      if (!ALPHTokenInfo || !ALPHChain || !ETHTokenInfo) {
        return showMessage({
          message: "Something went wrong",
          type: "danger",
        })
      }

      // Add ETH token to Eth network
      if (!ethNetworkETHCoin) {
        currentWalletStore
          .addAutoAsset({
            name: ETHTokenInfo.name,
            chain: ETHChain.id,
            symbol: ETHTokenInfo.symbol,
            cid: ETHTokenInfo.id,
            type: ETHTokenInfo.type,
            contract: ETHChain.contract,
            image: ETHTokenInfo.thumb,
          })
          .then(() => {
            showMessage({
              message: "Coin added to wallet",
              type: "success",
            })
          })
          .catch(e => {
            console.log(e)
            showMessage({
              message: "Something went wrong",
              type: "danger",
            })
          })
      }

      // Add ALPH token to Eth network
      if (!ethNetworkAlephiumCoin) {
        currentWalletStore
          .addAutoAsset({
            name: ALPHTokenInfo.name,
            chain: ALPHChain.id,
            symbol: ALPHTokenInfo.symbol,
            cid: ALPHTokenInfo.id,
            type: ALPHTokenInfo.type,
            contract: ALPHChain.contract,
            image: ALPHTokenInfo.thumb,
          })
          .then(() => {
            showMessage({
              message: "Coin added to wallet",
              type: "success",
            })
          })
          .catch(e => {
            console.log(e)
            showMessage({
              message: "Something went wrong",
              type: "danger",
            })
          })
      }
    }

    const onPressCopyTxId = (txId: string) => {
      if (!!txId) {
        Clipboard.setString(txId)
        modalFlashRef?.current?.showMessage({
          type: "success",
          message: "Copied to clipboard",
        })
      }
    }

    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
        scrollViewRef?.current?.scrollToEnd()
      })
      return () => keyboardDidShowListener.remove()
    }, [scrollViewRef?.current])

    return (
      <>

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
                <View
                  style={[stylesComponent.walletsWrapper, !!ethNetworkAlephiumCoin && stylesComponent.walletsWrapperWithTwoChild]}>
                  <CurrencyDescriptionBlock
                    asset={asset}
                    icon="transfer"
                    balance="freeBalance"
                    title="Available balance"
                    styleBalance={!!ethNetworkAlephiumCoin && stylesComponent.balanceText}
                  />
                  {!!ethNetworkAlephiumCoin &&
                    <CurrencyDescriptionBlock
                      asset={ethNetworkETHCoin}
                      icon="transfer"
                      balance="freeBalance"
                      title="Available balance"
                      styleBalance={!!ethNetworkAlephiumCoin && stylesComponent.balanceText}
                    />
                  }
                </View>

                {alephiumBridgeStore.isTransferring && (
                  <View style={stylesComponent.transferLoadingMessageWrapper}>
                    <ActivityIndicator />
                    <Text style={stylesComponent.transferLoadingMessage}>Waiting for transaction confirmation...</Text>
                  </View>
                )}


                {!alephiumBridgeStore.bridgingAmount &&
                  <>
                    {(!ethNetworkETHCoin || !ethNetworkAlephiumCoin) &&
                      <View style={[stylesComponent.infoCard, { marginTop: 24 }]}>
                        <Text style={stylesComponent.infoCardTitle}>Important</Text>
                        <Text style={stylesComponent.infoCardMessage}>
                          You need to add Ethereum (and its ALPH ERC20 token) to your wallet before performing bridge
                          operations
                        </Text>
                      </View>
                    }

                    {!!ethNetworkAlephiumCoin && !!ethNetworkETHCoin && ethNetworkETHCoin?.balanceWithDerivedAddresses === 0 &&
                      <View style={[stylesComponent.infoCard, stylesComponent.infoCardGold, { marginTop: 24 }]}>
                        <Text style={stylesComponent.infoCardTitle}>Important</Text>
                        <Text style={stylesComponent.infoCardMessage}>
                          You don’t have any funds in your Ethereum wallet.
                          Note that you will have to pay ethereum transaction fees and you will need some ETH to
                          finalize
                          the
                          process
                        </Text>
                      </View>
                    }

                    {!ethNetworkAlephiumCoin &&
                      <Button
                        style={PRIMARY_BTN}
                        textStyle={{ color: palette.white }}
                        text="Add Ethereum network to the wallet"
                        onPress={onPressGoAddEthereum}
                      />
                    }

                    {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin && !alephiumBridgeStore.isProcessingConfirmations &&
                      <View>
                        <Controller
                          control={control}
                          name="amount"
                          render={({ field: { onChange, value, onBlur } }) => (
                            <View style={stylesComponent.labelWrapper}>
                              <Text style={stylesComponent.label}>Amount to bridge</Text>
                              <View style={stylesComponent.inputFiledWrapper}>
                                <TextInput style={stylesComponent.inputFiled} returnKeyType={"done"} numberOfLines={1}
                                           keyboardType="numeric" onBlur={onBlur} value={value}
                                           onChangeText={onChange} />
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
                    }

                    {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin && !alephiumBridgeStore.isProcessingConfirmations &&
                      <View style={stylesComponent.checkboxes}>
                        {checkboxes.map((el, index) => {
                          return (
                            <Controller
                              key={index}
                              control={control}
                              name="checkbox"
                              render={({ field: { onChange, value } }) => {
                                const cond = value !== null && +value === +el.value
                                return (
                                  <Pressable
                                    style={[stylesComponent.checkbox, cond && stylesComponent.checkboxActive]}
                                    key={el.value} onPress={() => {
                                    onChange(cond ? null : el.value)
                                    if (asset?.balance === undefined) return
                                    const amountValue = cond ? "" : (asset?.balance * el.percent / 100).toString()
                                    setFormValue("amount", amountValue)
                                  }}>
                                    <Text style={stylesComponent.checkboxText}>{el.title}</Text>
                                  </Pressable>
                                )
                              }}
                            />
                          )
                        })}
                      </View>
                    }
                  </>
                }
              </View>

              {alephiumBridgeStore.isProcessingConfirmations &&
                <View style={{ marginTop: 24 }}>
                  <AlephimPendingBride
                    hideRedeem={true}
                    onPressCopyTxId={onPressCopyTxId}
                    txId={alephiumBridgeStore.currentTxId}
                    currentConfirmations={alephiumBridgeStore.chainConfirmations}
                    minimalConfirmations={BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL} />
                </View>
              }

              {alephiumBridgeStore.signedVAA &&
                <View style={stylesComponent.redeemCoinsWrapper}>
                  <RedeemCoins
                    from={asset}
                    to={ethNetworkETHCoin}
                    bridging={alephiumBridgeStore.bridgingAmount} />
                </View>
              }

            </ScrollView>
            {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin && !alephiumBridgeStore.bridgingAmount &&
              <View style={stylesComponent.previewOperation}>
                <WalletButton
                  text={"Preview the operation"}
                  type="primary"
                  outline={true}
                  // disabled={!isValid || ethNetworkETHCoin?.balanceWithDerivedAddresses === 0}
                  onPress={() => {
                    Keyboard.dismiss()
                    handleSubmit(onSubmit)()
                  }}
                />
              </View>
            }

            {!!alephiumBridgeStore.bridgingAmount && !alephiumBridgeStore.isProcessingConfirmations &&
              <View style={stylesComponent.previewOperation}>
                <WalletButton
                  type="primary"
                  outline={true}
                  text={"Preview the operation"}
                  onPress={() => setIsPreview(true)}
                  disabled={alephiumBridgeStore.loadingSignedVAA || alephiumBridgeStore.isRedeemProcessing}
                >
                    {(alephiumBridgeStore.loadingSignedVAA || alephiumBridgeStore.isRedeemProcessing) &&
                      <ActivityIndicator />
                    }
                </WalletButton>
                {alephiumBridgeStore.loadingSignedVAA &&
                  <Text style={stylesComponent.transferLoadingMessage}>Getting signed VAA...</Text>
                }
                {alephiumBridgeStore.isRedeemProcessing &&
                  <Text style={stylesComponent.transferLoadingMessage}>Waiting for transaction confirmation...</Text>
                }
              </View>
            }

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
                  disabled={alephiumBridgeStore.signedVAA ? false : sending || !sendable}
                  style={styles.DRAWER_BTN_OK}
                  textStyle={styles.DRAWER_BTN_TEXT}
                  onPress={() => alephiumBridgeStore.signedVAA ? redeemOnEthHandler() : processTransaction()}
                />,
              ]}>
              <View style={styles.DRAWER_CARD}>
                {!alephiumBridgeStore.signedVAA &&
                  <>
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
                  </>
                }

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
                      {!!alephiumBridgeStore.bridgingAmount && (
                        <>
                          {alephiumBridgeStore.totalFees} ETH
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

          <Footer onLeftButtonPress={goBack} />
        </KeyboardAvoidingView>
        <FlashMessage ref={modalFlashRef} position="bottom" />
      </>
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
    justifyContent: "center",
  },
  walletsWrapperWithTwoChild: {
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  balanceText: {
    fontSize: 18,
    marginTop: -14,
    fontWeight: "bold",
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
  transferLoadingMessageWrapper: {
    gap: 8,
    marginTop: 16,
  },
  transferLoadingMessage: {
    textAlign: "center",
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
    gap: 16,
    marginTop: 29,
    marginBottom: 16,
    alignItems: "center",
  },
  redeemCoinsWrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
})
