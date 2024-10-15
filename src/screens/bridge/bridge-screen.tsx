import React, { FC, useRef, useEffect, useState, useCallback, useMemo } from "react"
import * as alephiumMainnetConfig from "../../bridges/alephium/artifacts/.deployments.mainnet.json"
import AlephimPendingBride from "components/alephimPendingBride/alephimPendingBride.tsx"
import handCoinIcon from "assets/icons/hand-coin.svg"
import { ethers } from "ethers"
import { SvgXml } from "react-native-svg"
import { presets } from "components/screen/screen.presets"
import { palette } from "theme/palette.ts"
import { observer } from "mobx-react-lite"
import { atob, btoa } from "react-native-quick-base64"
import { showMessage } from "react-native-flash-message"
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
  sleep,
  NodeProvider,
  ALPH_TOKEN_ID,
  subscribeToTxStatus,
  MINIMAL_CONTRACT_DEPOSIT,
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
  KeyboardAvoidingView,
} from "react-native"
import {
  approveEth,
  CHAIN_ID_ETH,
  uint8ArrayToHex,
  hexToUint8Array,
  CHAIN_ID_ALEPHIUM,
  getSignedVAAWithRetry,
  getAttestTokenHandlerId,
  parseSequenceFromLogAlph,
  transferLocalTokenFromAlph,
  updateRemoteTokenPoolOnAlph,
  parseTargetChainFromLogAlph,
  createRemoteTokenPoolOnAlph,
  MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
} from "@alephium/wormhole-sdk"

import styles from "./styles"

global.atob = atob
global.btoa = btoa

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

const tokens = require("@config/tokens.json")

export const BridgeScreen: FC<StackScreenProps<NavigatorParamList, "bridge">> =
  observer(function BridgeScreen({ route }) {

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
        (CONFIG.getConfigFor(asset.chain, "bridge") as BridgeSettings) || null

      if (!bridgeConfig) {
        return false
      }
      const bAmount = BigInt(Number(amount) * 1000000000000000000)

      try {
        console.log("MESSAGEFEEEEEEEEEEEEEEEE", bridgeConfig.config.messageFee)
        const tx = await transferLocalTokenFromAlph(
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
        // const tx = {
        //   "fromGroup": 0,
        //   "gasAmount": 51399,
        //   "gasPrice": 100000000000n,
        //   "groupIndex": 0,
        //   "signature": "d5153782a2a75e4e40c1ed676a64710a9f23d8631d26eeb98ff348e4028fae625d99f2a657c2745b24e5ad31b5b68f80de03e0af4186b7b3c0cfe27eadbdadaf",
        //   "toGroup": 0,
        //   "txId": "d13d1849cad2493655160b81600cdc54540df80209e8f816ec1531d4f6e47419",
        //   "unsignedTx": "0000010101030001001a0c0d1440207f42f8e21128e70c7a30098a32c5c388de7eb4ffc6ef7dd86f72e8e11acc4800010a17001500626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a15007a1600a2144020000000000000000000000000000000000000000000000000000000000000000013c3038d7ea4c68000a31500626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a150014402000000000000000000000000000000000000000000000000000000000000000001340ff0e1440207f42f8e21128e70c7a30098a32c5c388de7eb4ffc6ef7dd86f72e8e11acc480013c3038d7ea4c6800016000c14040a3a00001340cd130a0c1440207f42f8e21128e70c7a30098a32c5c388de7eb4ffc6ef7dd86f72e8e11acc480001108000c8c7c1174876e80001d5b05c7d103c4e78b1c970d73e800d59ba070221030196c6a0488a38a3c7489bb6f4763c000237c37e212b80fde49d8cc01179d213e9fe3cef91d04de96eec21a936d43a8f4301c403a454b1962ff00000626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a150000000000000000000000",
        // }
        //
        console.log({ tx })

        subscribeToTxStatus({
          pollingInterval: 1000,
          messageCallback: async (event) => {
            // const event = {"type": "MemPooled"}
            // const event = {"blockHash": "000000000000256106c8eb591ac5477f99957b9cbae8f83055d3088af6f7fb20", "chainConfirmations": 1, "fromGroupConfirmations": 1, "toGroupConfirmations": 1, "txIndex": 1, "type": "Confirmed"}

            console.log("event", event)
            if (event.type === "Confirmed") {
              const confirmed = await waitALPHTxConfirmed(nodeProvider, tx.txId, MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL)

              const ethNodeProvider = new ethers.providers.JsonRpcProvider("https://node-ethereum.sezame.app")
              const signer = new ethers.Wallet(ethNetworkETHCoin!.privateKey, ethNodeProvider)
              const balance = await ethNodeProvider.getBalance(signer.address)

              console.log("Balance:", ethers.utils.formatEther(balance))

              const res = await approveEth(
                "0x579a3bDE631c3d8068CbFE3dc45B0F14EC18dD43",
                ethNetworkAlephiumCoin!.address,
                signer,
                bAmount,
                {
                  gasLimit: tx.gasAmount,
                  gasPrice: tx.gasPrice,
                },
              )

              // const res = {
              //   "blockHash": "0x7be487607c100a3d9d2fba59e5922658b9f620d9b080d7ce3c7d82799dc27b1a",
              //   "blockNumber": 20970399,
              //   "byzantium": true,
              //   "confirmations": 1,
              //   "contractAddress": null,
              //   "cumulativeGasUsed": { "hex": "0xba6689", "type": "BigNumber" },
              //   "effectiveGasPrice": { "hex": "0x174876e800", "type": "BigNumber" },
              //   "events": [],
              //   "from": "0x1105886df9185c4823b03F93Fb1E0b655AF04286",
              //   "gasUsed": { "hex": "0x5480", "type": "BigNumber" },
              //   "logs": [],
              //   "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
              //   "status": 1,
              //   "to": "0x1105886df9185c4823b03F93Fb1E0b655AF04286",
              //   "transactionHash": "0x0417144616464479790d1f3903b58c7f6a8576dd25e1ff91309f71829013dfdd",
              //   "transactionIndex": 147,
              //   "type": 2,
              // }

              console.log("res", res)

              function isAlphTxConfirmed(txStatus: node.TxStatus): txStatus is node.Confirmed {
                return txStatus.type === "Confirmed"
              }

              async function waitALPHTxConfirmed(provider: NodeProvider, txId: string, confirmations: number): Promise<node.Confirmed> {
                try {
                  const txStatus = await provider.transactions.getTransactionsStatus({ txId: txId })
                  // @ts-ignore
                  console.log(`Confirmations: ${txStatus?.chainConfirmations}/${confirmations}`)
                  if (isAlphTxConfirmed(txStatus) && txStatus.chainConfirmations >= confirmations) {
                    return txStatus as node.Confirmed
                  }
                } catch (error) {
                  console.error(`Failed to get tx status, tx id: ${txId}`)
                }
                const ALEPHIUM_POLLING_INTERVAL = 10000
                await sleep(ALEPHIUM_POLLING_INTERVAL)
                return waitALPHTxConfirmed(provider, txId, confirmations)
              }

              async function getTxInfo(provider: NodeProvider, txId: string) {
                const events = await provider.events.getEventsTxIdTxid(txId, { group: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.groupIndex })
                const event = events.events.find((event) => event.contractAddress === alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId)
                if (typeof event === "undefined") {
                  return Promise.reject(`Failed to get event for tx: ${txId}`)
                }
                const WormholeMessageEventIndex = 0
                if (event.eventIndex !== WormholeMessageEventIndex) {
                  return Promise.reject("invalid event index: " + event.eventIndex)
                }
                const sender = event.fields[0]
                if (sender.type !== "ByteVec") {
                  return Promise.reject("invalid sender, expect ByteVec type, have: " + sender.type)
                }
                const senderContractId = (sender as node.ValByteVec).value
                if (senderContractId !== alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId) {
                  return Promise.reject("invalid sender, expect token bridge contract id, have: " + senderContractId)
                }
                const sequence = parseSequenceFromLogAlph(event)
                const targetChain = parseTargetChainFromLogAlph(event)
                return { sequence, targetChain }
              }

              async function waitTxConfirmedAndGetTxInfo(provider: NodeProvider, txId: string): Promise<any> {
                const confirmed = await waitALPHTxConfirmed(provider, txId, MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL)
                const { sequence, targetChain } = await getTxInfo(provider, txId)
                // const blockHeader = await provider.blockflow.getBlockflowHeadersBlockHash(confirmed.blockHash)
                // return new AlphTxInfo(blockHeader, txId, sequence, targetChain, confirmed.chainConfirmations)
                return { sequence, targetChain }
              }

              const shouldUpdate = false
              const attestTokenHandlerId = getAttestTokenHandlerId(alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId, CHAIN_ID_ALEPHIUM, alephiumMainnetConfig.contracts.TokenBridge.contractInstance.groupIndex)
              const txInfo = await waitTxConfirmedAndGetTxInfo(nodeProvider, tx.txId)
              console.log("txInfo.sequence", txInfo.sequence)
              console.log("start")
              const { vaaBytes } = await getSignedVAAWithRetry(
                ["https://guardian-0.bridge.alephium.org"],
                CHAIN_ID_ALEPHIUM,
                alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId,
                CHAIN_ID_ETH,
                txInfo.sequence,
              )
              console.log("end")
              console.log("vaaBytes", vaaBytes)
              const signedVAA = vaaBytes ? hexToUint8Array(uint8ArrayToHex(vaaBytes)) : undefined
              console.log("signedVAA", signedVAA)
              if (signedVAA) {
                const result = shouldUpdate
                  ? await updateRemoteTokenPoolOnAlph(wallet, attestTokenHandlerId, signedVAA)
                  : await createRemoteTokenPoolOnAlph(wallet, attestTokenHandlerId, signedVAA, wallet.account.address, MINIMAL_CONTRACT_DEPOSIT)
                console.log("result", result)
              }
            }
          },
          errorCallback: (error) => {
            console.log("error", error)
          },
        }, tx.txId)

      } catch (err) {
        console.log("THERE WAS AN ERROR IN transferLocalTokenFromAlph", err)
      } finally {
        console.log("Done...")
      }

      console.log("TRANSFER DONEEEEEEEEEEEEE")
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
      // navigation.navigate('createWallet');
      const tokenInfo = tokens.find((el: any) => el.id === "alephium")
      const chain = tokenInfo.chains.find((el: any) => el.id === "ETH")
      if (!tokenInfo || !chain) return

      currentWalletStore
        .addAutoAsset({
          name: tokenInfo.name,
          chain: chain.id,
          symbol: tokenInfo.symbol,
          cid: tokenInfo.id,
          type: tokenInfo.type,
          contract: chain.contract,
          image: tokenInfo.thumb,
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

              {!ethNetworkAlephiumCoin &&
                <View style={[stylesComponent.infoCard, { marginTop: 24 }]}>
                  <Text style={stylesComponent.infoCardTitle}>Important</Text>
                  <Text style={stylesComponent.infoCardMessage}>
                    You need to add Ethereum (and its ALPH ERC20 token) to your wallet before performing bridge
                    operations
                  </Text>
                </View>
              }

              <AlephimPendingBride asset={asset} />

              {/*{!!ethNetworkAlephiumCoin && !!ethNetworkETHCoin && ethNetworkETHCoin?.balanceWithDerivedAddresses === 0 &&*/}
              {/*  <View style={[stylesComponent.infoCard, stylesComponent.infoCardGold, { marginTop: 24 }]}>*/}
              {/*    <Text style={stylesComponent.infoCardTitle}>Important</Text>*/}
              {/*    <Text style={stylesComponent.infoCardMessage}>*/}
              {/*      You don’t have any funds in your Ethereum wallet.*/}
              {/*      Note that you will have to pay ethereum transaction fees and you will need some ETH to finalize the*/}
              {/*      process*/}
              {/*    </Text>*/}
              {/*  </View>*/}
              {/*}*/}

              {!ethNetworkAlephiumCoin &&
                <Button
                  style={PRIMARY_BTN}
                  textStyle={{ color: palette.white }}
                  text="Add Ethereum network to the wallet"
                  onPress={onPressGoAddEthereum}
                />
              }


              {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin &&
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
              }

              {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin &&
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
                              key={el.value} onPress={() => onChange(cond ? null : el.value)}>
                              <Text style={stylesComponent.checkboxText}>{el.title}</Text>
                            </Pressable>
                          )
                        }}
                      />
                    )
                  })}
                </View>
              }
            </View>

          </ScrollView>
          {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin &&
            <View style={stylesComponent.previewOperation}>
              <WalletButton
                type="primary"
                text="Preview the operation"
                outline={true}
                disabled={!isValid || ethNetworkETHCoin?.balanceWithDerivedAddresses === 0}
                onPress={() => {
                  Keyboard.dismiss()
                  handleSubmit(onSubmit)()
                }}
              />
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

        <Footer onLeftButtonPress={goBack} />
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
    marginBottom: 16,
    alignItems: "center",
  },
})
