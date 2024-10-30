import React, { FC, useRef, useEffect, useState, useCallback, useMemo } from "react"
import AlephimPendingBride from "components/alephimPendingBride/alephimPendingBride.tsx"
import * as base58 from 'bs58';
import Clipboard from "@react-native-clipboard/clipboard"
import { grpc } from "@improbable-eng/grpc-web"
import { ReactNativeTransport } from "@improbable-eng/grpc-web-react-native-transport"
import { ethers } from "ethers"
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
import { spacing } from "theme"
import { Controller, useForm, useWatch } from "react-hook-form"
import { BaseWalletDescription, useStores } from "models"
import { CONFIG, Chains, NodeProviderGenerator } from "@maze2/sezame-sdk"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { PRIMARY_BTN, MainBackground, BackgroundStyle, drawerErrorMessage } from "theme/elements"
import { web3, node, NodeProvider, ALPH_TOKEN_ID } from "@alephium/web3"
import { Text, Footer, Button, Drawer, WalletButton, CurrencyDescriptionBlock } from "components"
import {
  View,
  Keyboard,
  Platform,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native"
import {
  ChainId,
  isEVMChain,
  approveEth,
  redeemOnEth,
  CHAIN_ID_ETH,
  uint8ArrayToHex,
  transferFromEth,
  hexToUint8Array,
  ethers_contracts,
  CHAIN_ID_ALEPHIUM,
  waitAlphTxConfirmed,
  getEmitterAddressEth,
  parseSequenceFromLogEth,
  parseSequenceFromLogAlph,
  transferLocalTokenFromAlph,
  parseTargetChainFromLogAlph,
} from "@alephium/wormhole-sdk"

import styles from "./styles"
import RedeemCoins from "components/redeemCoins/redeemCoins.tsx"
import alephiumBridgeStore from "../../mobx/alephiumBridgeStore.tsx"
import { AlphTxInfo } from "screens/bridge/AlphTxInfo.ts"
import { getSignedVAAWithRetry } from "screens/bridge/getSignedVAAWithRetry.ts"
import {
  getConfigs,
  ALPH_DECIMAL,
  CHECKBOXES_PERCENT,
  ICheckboxPercentItem,
  WormholeMessageEventIndex,
} from "./constsnts.ts"
import AlephiumInput from "components/AlephiumInput/AlephiumInput.tsx"
import AlephiumBridgeBadge from "components/AlephiumBridgeBadge/AlephiumBridgeBadge.tsx"
import AlephiumPercentCheckBox from "components/AlephiumPercentCheckBox/AlephiumPercentCheckBox.tsx"
import LoadingTransactionConfirmation
  from "components/LoadingTransactionConfirmation/LoadingTransactionConfirmation.tsx"
import { getEVMCurrentBlockNumber, waitEVMTxConfirmed } from "screens/bridge/helper-functions.ts"

global.atob = atob
global.btoa = btoa
grpc.setDefaultTransport(ReactNativeTransport({ withCredentials: true }))


type BridgeDetails = {
  nodeProvider?: NodeProvider | null;
  signer?: PrivateKeyWallet | null;
  bridgeConfig?: BridgeSettings | null;
};

const tokens = require("@config/tokens.json")

export const BridgeScreen: FC<StackScreenProps<NavigatorParamList, "bridge">> = observer(function BridgeScreen({ route }) {
  const modalFlashRef = useRef<FlashMessage>()
  const scrollViewRef = useRef<ScrollView | null>(null)
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const rootStore = useStores()
  // Pull in one of our MST stores
  const { currentWalletStore, pendingTransactions, exchangeRates } = useStores()
  const { getSelectedAddressForAsset, assets, wallet } = currentWalletStore
  // Pull in navigation via hook
  const asset = getSelectedAddressForAsset(route.params.coinId, route.params.chain)

  const [bridgeDetails, setBridgeDetails] = useState<BridgeDetails>({
    nodeProvider: null,
    signer: null,
    bridgeConfig: null,
  })
  const [fees, setFees] = useState<any>(null)
  const [isPreview, setIsPreview] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const [sendable, setSendable] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(0)
  const numericRegEx = useRef(/^\d+(.\d+)?$/).current
  const { setBalance } = currentWalletStore

  const { control, handleSubmit, watch, setValue: setFormValue, formState: { errors, isValid } } = useForm({
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

  const BRIDGE_CONSTANTS = useMemo(() => (getConfigs(rootStore.TESTNET ? "testnet" : "mainnet")), [rootStore.TESTNET])
  const alphNetworkAlephiumCoin = useMemo(() => assets.find((el) => el.chain === "ALPH" && el.cid === "alephium"), [assets.length])
  const ethNetworkETHCoin = useMemo(() => assets.find((el) => el.chain === "ETH" && el.cid === "ethereum"), [assets.length])
  const ethNetworkAlephiumCoin = useMemo(() => assets.find((el) => el.chain === "ETH" && el.cid === "alephium"), [assets.length])

  const onSubmit = async () => {
    setErrorMsg(null)
    try {
      if (!asset || amount === null) {
        return
      }
      const { bridgeConfig } = bridgeDetails
      if (!bridgeConfig) return

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
      // transferToBridgeFromALPH(amount);
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

  const transferToBridgeFromALPH = async (amount: number) => {
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
      alephiumBridgeStore.setIsTransferringFromALPH(true)

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
      alephiumBridgeStore.setIsTransferringFromALPH(false)

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

  const truncateRecipient = (hash: string) => {
    return (
      hash.substring(0, 8) +
      "..." +
      hash.substring(hash.length - 8, hash.length)
    )
  }

  const processTransaction = async () => {
    if (!amount || !asset) return
    setSending(true)
    try {
      transferToBridgeFromALPH(amount).catch()
      setFees(null)
      setIsPreview(false)
      navigation.goBack()
    } catch (err: any) {
      showMessage({ message: err.message, type: "danger" })
    } finally {
      setSending(false)
    }
  }

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

  const onPressGoAddAlephium = () => {
    const ALPHTokenInfo = tokens.find((el: any) => el.id === "alephium")
    const ALPHChain = ALPHTokenInfo.chains.find((el: any) => el.id === "ALPH")

    if (!ALPHTokenInfo || !ALPHChain) {
      return showMessage({
        message: "Something went wrong",
        type: "danger",
      })
    }

    // Add Alephium token to ALPH network
    if (!alphNetworkAlephiumCoin) {
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

  const onPressCopyTxIdHandler = (txId: string) => {
    if (!!txId) {
      Clipboard.setString(txId)
      modalFlashRef?.current?.showMessage({
        type: "success",
        message: "Copied to clipboard",
      })
    }
  }

  const onPressPercentHandler = (el: ICheckboxPercentItem, checked: boolean, onChange: any) => {
    onChange(checked ? null : el.value)
    if (asset?.balance === undefined) return
    const amountValue = checked ? "" : (asset?.balance * el.percent / 100).toString()
    setFormValue("amount", amountValue)
  }

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

  /**FROM ETH**/
  const [currentBlock, setCurrentBlock] = useState(0)
  const [lastBlockUpdatedTs, setLastBlockUpdatedTs] = useState(Date.now())
  const [singedVaa, setSingedVaa] = useState<any>(null)

  const approveEthHandler = async () => {
    Keyboard.dismiss()
    const ethNodeProvider = new ethers.providers.JsonRpcProvider(BRIDGE_CONSTANTS.ETH_JSON_RPC_PROVIDER_URL)
    const signer = new ethers.Wallet(ethNetworkETHCoin!.privateKey, ethNodeProvider)
    const bAmount = BigInt(Number(amount) * ALPH_DECIMAL) // decimals 18

    alephiumBridgeStore.setIsApprovingEth(true)
    const result = await approveEth(
      BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS,
      BRIDGE_CONSTANTS.ALEPHIUM_ADDRESS_IN_ETH_NETWORK,
      signer,
      bAmount,
    )
    alephiumBridgeStore.setApprovedEthResult(result)
    alephiumBridgeStore.setIsApprovingEth(false)

    // const result = {
    //   "blockHash": "0x4a312567206c0394e3ef6d45aee4fb18066661f5a1ba3b6c0e2ecb510dac5beb",
    //   "blockNumber": 6936899,
    //   "byzantium": true,
    //   "confirmations": 1,
    //   "contractAddress": null,
    //   "cumulativeGasUsed": { "hex": "0x0514c8", "type": "BigNumber" },
    //   "effectiveGasPrice": { "hex": "0x013057e376", "type": "BigNumber" },
    //   "events": [{
    //     "address": "0xD62Efc730439F0ad1D6B29448ff9aE894B7857c1",
    //     "args": [Array],
    //     "blockHash": "0x4a312567206c0394e3ef6d45aee4fb18066661f5a1ba3b6c0e2ecb510dac5beb",
    //     "blockNumber": 6936899,
    //     "data": "0x00000000000000000000000000000000000000000000000000038d7ea4c68000",
    //     "decode": [Function anonymous],
    //     "event": "Approval",
    //     "eventSignature": "Approval(address,address,uint256)",
    //     "getBlock": [Function anonymous],
    //     "getTransaction": [Function anonymous],
    //     "getTransactionReceipt": [Function anonymous],
    //     "logIndex": 3,
    //     "removeListener": [Function anonymous],
    //     "topics": [Array],
    //     "transactionHash": "0x9ae3173e4c2d88100585caabdd9db97bb86c1c18d2c561d69e71de8e253d09e3",
    //     "transactionIndex": 8,
    //   }],
    //   "from": "0x1105886df9185c4823b03F93Fb1E0b655AF04286",
    //   "gasUsed": { "hex": "0xf042", "type": "BigNumber" },
    //   "logs": [{
    //     "address": "0xD62Efc730439F0ad1D6B29448ff9aE894B7857c1",
    //     "blockHash": "0x4a312567206c0394e3ef6d45aee4fb18066661f5a1ba3b6c0e2ecb510dac5beb",
    //     "blockNumber": 6936899,
    //     "data": "0x00000000000000000000000000000000000000000000000000038d7ea4c68000",
    //     "logIndex": 3,
    //     "topics": [Array],
    //     "transactionHash": "0x9ae3173e4c2d88100585caabdd9db97bb86c1c18d2c561d69e71de8e253d09e3",
    //     "transactionIndex": 8,
    //   }],
    //   "logsBloom": "0x00004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000008000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000010000000800000000000001000000000000000010000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000002000000000000000000",
    //   "status": 1,
    //   "to": "0xD62Efc730439F0ad1D6B29448ff9aE894B7857c1",
    //   "transactionHash": "0x9ae3173e4c2d88100585caabdd9db97bb86c1c18d2c561d69e71de8e253d09e3",
    //   "transactionIndex": 8,
    //   "type": 2,
    // }

    console.log("result", result)
  }

  const getBlockProgress = async (evmProvider: ethers.providers.Provider, chainId: ChainId) => {
    while (!singedVaa) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      try {
        const newBlock = await getEVMCurrentBlockNumber(evmProvider, chainId)
        setCurrentBlock((prev) => {
          const now = Date.now()
          if (prev !== newBlock) {
            setLastBlockUpdatedTs(now)
          }
          return newBlock
        })

      } catch (e) {
        console.error(e)
      }
    }
  }

  const transferToBridgeFromETH = async () => {
    console.log("start")
    try {
      alephiumBridgeStore.setIsTransferringFromETH(true)
      const ethNodeProvider = new ethers.providers.JsonRpcProvider(BRIDGE_CONSTANTS.ETH_JSON_RPC_PROVIDER_URL)
      const signer = new ethers.Wallet(ethNetworkETHCoin!.privateKey, ethNodeProvider)
      const bAmount = BigInt(Number(amount) * ALPH_DECIMAL) // decimals 18

      const generator = await NodeProviderGenerator.getNodeProvider(asset?.chain as Chains)
      // @ts-ignore
      const nodeProvider: NodeProvider = generator.getNodeProvider()
      web3.setCurrentNodeProvider(nodeProvider)

      const wallet = new PrivateKeyWallet({
        privateKey: asset?.privateKey || "",
        nodeProvider,
      })
      const feeParsed = ethers.utils.parseUnits("0", 18)

      const receipt = await transferFromEth(
        BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS,
        signer,
        BRIDGE_CONSTANTS.ALEPHIUM_ADDRESS_IN_ETH_NETWORK,
        bAmount,
        CHAIN_ID_ALEPHIUM,
        base58.decode(wallet.account.address),
        feeParsed
      )
      alephiumBridgeStore.setReceipt(receipt)

      console.log("Receipt")
      console.log(JSON.stringify(receipt, null, 2))

      const sequence = parseSequenceFromLogEth(receipt, BRIDGE_CONSTANTS.ETH_BRIDGE_ADDRESS)
      console.log("sequence", sequence)

      console.log('Getting emitterAddress')
      const emitterAddress = getEmitterAddressEth(
        BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS,
      )
      console.log('[emitterAddress]', emitterAddress)

      if (signer.provider) {
        console.log('[waitEVMTxConfirmed] [Pending]')
        await waitEVMTxConfirmed(signer.provider, receipt.blockNumber, CHAIN_ID_ETH)
        console.log('[waitEVMTxConfirmed] [Success]')
      }

      const transactionHash = receipt.transactionHash
      const blockHeight = receipt.blockNumber
      // const isFinalized = currentBlock >= tx.blockHeight;

      const data = getBlockProgress(ethNodeProvider, CHAIN_ID_ETH)

      const { vaaBytes } = await getSignedVAAWithRetry(
        BRIDGE_CONSTANTS.WORMHOLE_RPC_HOSTS,
        CHAIN_ID_ETH,
        emitterAddress,
        CHAIN_ID_ALEPHIUM,
        sequence.toString(),
      )
      setSingedVaa(vaaBytes)

      // console.log("vaaBytes", vaaBytes)
      // const data = redeemOnEth(
      //   BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS,
      //   signer,
      // )
      alephiumBridgeStore.setIsTransferringFromETH(false)
    } catch (e) {
      console.log("error", e)
      alephiumBridgeStore.setIsTransferringFromETH(false)
    }

    // await transferFromEthWithoutWait(
    //   BRIDGE_CONSTANTS.ETH_TOKEN_BRIDGE_ADDRESS,
    //   signer,
    //   signer.address,
    //   bAmount,
    //   CHAIN_ID_ALEPHIUM,
    //   wallet.account.address,
    //   feeParsed
    // )
  }
  /**FROM ETH**/

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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      scrollViewRef?.current?.scrollToEnd()
    })
    return () => keyboardDidShowListener.remove()
  }, [scrollViewRef?.current])

  useEffect(() => {
    if (asset) {
      init(asset)
    }
  }, [asset?.address, asset?.chain, init])

  const rulesAmount = useMemo(() => {
    return {
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
    }
  }, [numericRegEx, asset])
  const fromAsset = useMemo(() => {
    switch (asset?.chain) {
      case "ETH":
        return { ...ethNetworkAlephiumCoin, image: ethNetworkETHCoin?.image }
      case "ALPH":
        return asset
    }
  }, [asset, ethNetworkAlephiumCoin, ethNetworkETHCoin])
  const toAsset = useMemo(() => {
    switch (asset?.chain) {
      case "ETH":
        return { ...alphNetworkAlephiumCoin, freeBalance: alphNetworkAlephiumCoin?.balanceWithDerivedAddresses }
      case "ALPH":
        return { ...ethNetworkAlephiumCoin, image: ethNetworkETHCoin?.image }
    }
  }, [asset, ethNetworkAlephiumCoin, ethNetworkETHCoin, alphNetworkAlephiumCoin])

  const currencyBlockCond = useMemo(() => {
    switch (asset?.chain) {
      case "ETH":
        return !!alphNetworkAlephiumCoin
      case "ALPH":
        return !!ethNetworkAlephiumCoin
    }
  }, [asset, ethNetworkAlephiumCoin, alphNetworkAlephiumCoin])

  const addButtonInfo = useMemo(() => {
    const mapper: any = {
      "ALPH": {
        text: "Add Ethereum network to the wallet",
        onAddHandler: onPressGoAddEthereum,
        isVisible: !ethNetworkAlephiumCoin,
      },
      "ETH": {
        text: "Add Alephium network to the wallet",
        onAddHandler: onPressGoAddAlephium,
        isVisible: !alphNetworkAlephiumCoin,
      },
    }
    return asset?.chain ? mapper[asset.chain] : ""
  }, [asset, ethNetworkAlephiumCoin, alphNetworkAlephiumCoin])

  const alephiumConfirmationsInfo = useMemo(() => {
    return {
      isVisible: alephiumBridgeStore.isProcessingConfirmations,
      txId: alephiumBridgeStore.currentTxId,
      currentConfirmations: alephiumBridgeStore.chainConfirmations,
      minimalConfirmations: BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL,
    }
  }, [alephiumBridgeStore.isProcessingConfirmations, alephiumBridgeStore.currentTxId, alephiumBridgeStore.chainConfirmations, BRIDGE_CONSTANTS])

  return (
    <>
      <KeyboardAvoidingView
        style={stylesComponent.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <ScrollView contentContainerStyle={stylesComponent.container} keyboardShouldPersistTaps={"handled"}>

            {/*<Text>currentBlock:{currentBlock}</Text>*/}
            {/*<Text>lastBlockUpdatedTs: {lastBlockUpdatedTs}</Text>*/}
            <View>
              <View
                style={[stylesComponent.walletsWrapper, currencyBlockCond && stylesComponent.walletsWrapperWithTwoChild]}>
                <CurrencyDescriptionBlock
                  asset={fromAsset}
                  icon="transfer"
                  balance="freeBalance"
                  title="Available balance"
                  styleBalance={currencyBlockCond && stylesComponent.balanceText}
                />
                {currencyBlockCond &&
                  <CurrencyDescriptionBlock
                    asset={toAsset}
                    icon="transfer"
                    balance="freeBalance"
                    title="Available balance"
                    styleBalance={currencyBlockCond && stylesComponent.balanceText}
                  />
                }
              </View>

              {alephiumBridgeStore.isTransferringFromALPH && (
                <LoadingTransactionConfirmation
                  activityIndicator={true}
                  message={"Waiting for transaction confirmation..."}
                />
              )}

              {!alephiumBridgeStore.bridgingAmount &&
                <>
                  <AlephiumBridgeBadge
                    title={"Important"}
                    style={stylesComponent.infoCard}
                    isShow={asset?.chain === "ALPH" && (!ethNetworkETHCoin || !ethNetworkAlephiumCoin)}
                    description={"You need to add Ethereum (and its ALPH ERC20 token) to your wallet before performing bridge operations"}
                  />
                  <AlephiumBridgeBadge
                    title={"Important"}
                    style={[stylesComponent.infoCard, stylesComponent.infoCardGold]}
                    isShow={asset?.chain === "ALPH" && !!ethNetworkAlephiumCoin && !!ethNetworkETHCoin && ethNetworkETHCoin?.balanceWithDerivedAddresses === 0}
                    description={"You don’t have any funds in your Ethereum wallet. Note that you will have to pay ethereum transaction fees and you will need some ETH to finalize the process"}
                  />
                  <AlephiumBridgeBadge
                    title={"Important"}
                    style={stylesComponent.infoCard}
                    isShow={asset?.chain === "ETH" && !alphNetworkAlephiumCoin}
                    description={"You need to add Alephium (and its ALPH ERC20 token) to your wallet before performing bridge operations"}
                  />
                  <AlephiumBridgeBadge
                    title={"Important"}
                    style={stylesComponent.infoCard}
                    isShow={asset?.chain === "ETH" && !!alphNetworkAlephiumCoin && !alephiumBridgeStore.isApprovingEth && !alephiumBridgeStore.approvedEthResult}
                    description={"Approve action will initiate the transfer on Ethereum and wait for finalization. If you navigate away from this page before completing Transfer step, you will have to perform the recovery workflow to complete the transfer."}
                  />

                  {
                    (
                      (asset?.chain === "ALPH" && !!ethNetworkETHCoin && !!ethNetworkAlephiumCoin && !alephiumBridgeStore.isProcessingConfirmations) ||
                      (asset?.chain === "ETH" && !alephiumBridgeStore.isApprovingEth && !alephiumBridgeStore.approvedEthResult)
                    ) && (
                      <>
                        <Controller
                          name="amount"
                          control={control}
                          rules={rulesAmount}
                          render={({ field: { onChange, value, onBlur } }) => (
                            <AlephiumInput value={value} onBlur={onBlur} onChangeText={onChange}
                                           errorMessage={errors?.["amount"]?.message || ""} />)}
                        />
                        <View style={stylesComponent.checkboxes}>
                          {CHECKBOXES_PERCENT.map((el, index) => {
                            return (
                              <Controller
                                key={index}
                                name="checkbox"
                                control={control}
                                render={({ field: { onChange, value } }) => {
                                  const checked = value !== null && +value === +el.value
                                  return (
                                    <AlephiumPercentCheckBox
                                      key={el.value}
                                      text={el.title}
                                      checked={checked}
                                      onPress={() => onPressPercentHandler(el, checked, onChange)} />)
                                }}
                              />
                            )
                          })}
                        </View>
                      </>
                    )
                  }
                </>
              }

              {addButtonInfo?.isVisible &&
                <Button
                  style={PRIMARY_BTN}
                  textStyle={{ color: palette.white }}
                  text={addButtonInfo?.text}
                  onPress={() => addButtonInfo?.onAddHandler?.()}
                />
              }
            </View>

            {alephiumConfirmationsInfo.isVisible &&
              <View style={{ marginTop: 24 }}>
                <AlephimPendingBride
                  hideRedeem={true}
                  onPressCopyTxId={onPressCopyTxIdHandler}
                  txId={alephiumConfirmationsInfo.txId}
                  currentConfirmations={alephiumConfirmationsInfo.currentConfirmations}
                  minimalConfirmations={alephiumConfirmationsInfo.minimalConfirmations} />
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
          {!!ethNetworkETHCoin && !!ethNetworkAlephiumCoin && !alephiumBridgeStore.bridgingAmount && asset?.chain === "ALPH" &&
            <View style={stylesComponent.previewOperation}>
              <WalletButton
                text={"Preview the operation"}
                type="primary"
                outline={true}
                disabled={!isValid || ethNetworkETHCoin?.balanceWithDerivedAddresses === 0}
                onPress={() => {
                  Keyboard.dismiss()
                  handleSubmit(onSubmit)()
                }}
              />
            </View>
          }

          {asset?.chain === "ETH" &&
            <View style={stylesComponent.previewOperation}>
              {!!alephiumBridgeStore.approvedEthResult ? (
                  <>
                    <WalletButton
                      text={"Transfer"}
                      type="primary"
                      outline={true}
                      onPress={transferToBridgeFromETH}
                      disabled={!alephiumBridgeStore.approvedEthResult || alephiumBridgeStore.isTransferringFromETH}
                    >
                      {alephiumBridgeStore.isTransferringFromETH &&
                        <ActivityIndicator />
                      }
                    </WalletButton>
                    {alephiumBridgeStore.isTransferringFromETH && !!alephiumBridgeStore.receipt &&
                      <LoadingTransactionConfirmation
                        message={`Waiting for finality on Ethereum which may take up to 15 minutes. Last finalized block number ${currentBlock} ${alephiumBridgeStore.receipt?.blockNumber}`}
                      />
                    }
                  </>
                )
                :
                (
                  <>
                    <WalletButton
                      text={"Approve"}
                      type="primary"
                      outline={true}
                      disabled={!isValid || alephiumBridgeStore.isApprovingEth}
                      onPress={approveEthHandler}
                    >
                      {alephiumBridgeStore.isApprovingEth &&
                        <ActivityIndicator />
                      }
                    </WalletButton>
                    {alephiumBridgeStore.isApprovingEth &&
                      <LoadingTransactionConfirmation message={"Waiting for transaction confirmation..."} />
                    }
                  </>
                )
              }
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
                <LoadingTransactionConfirmation message={"Getting signed VAA..."} />
              }
              {alephiumBridgeStore.isRedeemProcessing &&
                <LoadingTransactionConfirmation message={"Waiting for transaction confirmation..."} />
              }
            </View>
          }

        </ImageBackground>
        {isPreview && (
          <Drawer
            title="Sign and Submit"
            style={{ display: "flex" }}
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

        <Footer onLeftButtonPress={() => navigation.goBack()} />
      </KeyboardAvoidingView>
      <FlashMessage ref={modalFlashRef} position="bottom" />
    </>
  )
})


const stylesComponent = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    height: "100%",
    backgroundColor: palette.black,
  },
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
    marginTop: 24,
    marginBottom: 35,
  },
  infoCardGold: {
    marginTop: 24,
    backgroundColor: "#DBAF00",
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
  actionsContainer: {
    paddingHorizontal: 16,
  },
})
