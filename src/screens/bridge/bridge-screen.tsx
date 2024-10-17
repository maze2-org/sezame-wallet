import React, { FC, useRef, useEffect, useState, useCallback, useMemo } from "react"
import AlephimPendingBride from "components/alephimPendingBride/alephimPendingBride.tsx"
import handCoinIcon from "assets/icons/hand-coin.svg"
import { grpc } from "@improbable-eng/grpc-web"
import { ReactNativeTransport } from "@improbable-eng/grpc-web-react-native-transport"
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
  NodeProvider,
  ALPH_TOKEN_ID, subscribeToTxStatus,
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
  ChainId,
  redeemOnEth,
  CHAIN_ID_ETH,
  getSignedVAA,
  CHAIN_ID_ALEPHIUM,
  waitAlphTxConfirmed,
  parseSequenceFromLogAlph,
  transferLocalTokenFromAlph,
  parseTargetChainFromLogAlph,
} from "@alephium/wormhole-sdk"

import styles from "./styles"
import {
  getConfigs,
  ETH_JSON_RPC_PROVIDER_URL,
  WormholeMessageEventIndex,
} from "./constsnts.ts"

const BRIDGE_CONSTANTS = getConfigs("testnet")
console.log(BRIDGE_CONSTANTS)

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
        // const tx = await transferLocalTokenFromAlph(
        //   wallet,
        //   alephiumMainnetConfig.contracts.TokenBridge.contractInstance
        //     .contractId,
        //   wallet.account.address,
        //   ALPH_TOKEN_ID,
        //   CHAIN_ID_ETH,
        //   bridgeConfig.config.contracts.nativeTokenBridge,
        //   bAmount,
        //   BigInt(bridgeConfig.config.messageFee),
        //   0n,
        //   BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL,
        // )

        // subscribeToTxStatus({
        //   pollingInterval: 1000,
        //   messageCallback: async (event) => {
        //     // const event = {"type": "MemPooled"}
        //     // const event = {"blockHash": "000000000000256106c8eb591ac5477f99957b9cbae8f83055d3088af6f7fb20", "chainConfirmations": 1, "fromGroupConfirmations": 1, "toGroupConfirmations": 1, "txIndex": 1, "type": "Confirmed"}
        //
        //     console.log("event", event)
        //     if (event.type === "Confirmed") {
        //       const confirmed = await waitALPHTxConfirmed(nodeProvider, tx.txId, BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)
        //
        //       const ethNodeProvider = new ethers.providers.JsonRpcProvider("https://node-ethereum.sezame.app")
        //       const signer = new ethers.Wallet(ethNetworkETHCoin!.privateKey, ethNodeProvider)
        //       const balance = await ethNodeProvider.getBalance(signer.address)
        //
        //       console.log("Balance:", ethers.utils.formatEther(balance))
        //
        //       const res = await approveEth(
        //         "0x579a3bDE631c3d8068CbFE3dc45B0F14EC18dD43",
        //         ethNetworkAlephiumCoin!.address,
        //         signer,
        //         bAmount,
        //         {
        //           gasLimit: tx.gasAmount,
        //           gasPrice: tx.gasPrice,
        //         },
        //       )
        //
        //       function isAlphTxConfirmed(txStatus: node.TxStatus): txStatus is node.Confirmed {
        //         return txStatus.type === "Confirmed"
        //       }
        //
        //       async function waitALPHTxConfirmed(provider: NodeProvider, txId: string, confirmations: number): Promise<node.Confirmed> {
        //         try {
        //           const txStatus = await provider.transactions.getTransactionsStatus({ txId: txId })
        //           // @ts-ignore
        //           console.log(`Confirmations: ${txStatus?.chainConfirmations}/${confirmations}`)
        //           if (isAlphTxConfirmed(txStatus) && txStatus.chainConfirmations >= confirmations) {
        //             return txStatus as node.Confirmed
        //           }
        //         } catch (error) {
        //           console.error(`Failed to get tx status, tx id: ${txId}`)
        //         }
        //         const ALEPHIUM_POLLING_INTERVAL = 10000
        //         await sleep(ALEPHIUM_POLLING_INTERVAL)
        //         return waitALPHTxConfirmed(provider, txId, confirmations)
        //       }
        //
        //       async function getTxInfo(provider: NodeProvider, txId: string) {
        //         const events = await provider.events.getEventsTxIdTxid(txId, { group: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.groupIndex })
        //         const event = events.events.find((event) => event.contractAddress === BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID)
        //         if (typeof event === "undefined") {
        //           return Promise.reject(`Failed to get event for tx: ${txId}`)
        //         }
        //         const WormholeMessageEventIndex = 0
        //         if (event.eventIndex !== WormholeMessageEventIndex) {
        //           return Promise.reject("invalid event index: " + event.eventIndex)
        //         }
        //         const sender = event.fields[0]
        //         if (sender.type !== "ByteVec") {
        //           return Promise.reject("invalid sender, expect ByteVec type, have: " + sender.type)
        //         }
        //         const senderContractId = (sender as node.ValByteVec).value
        //         if (senderContractId !== BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID) {
        //           return Promise.reject("invalid sender, expect token bridge contract id, have: " + senderContractId)
        //         }
        //         const sequence = parseSequenceFromLogAlph(event)
        //         const targetChain = parseTargetChainFromLogAlph(event)
        //         return { sequence, targetChain }
        //       }
        //
        //       async function waitTxConfirmedAndGetTxInfo(provider: NodeProvider, txId: string): Promise<any> {
        //         const confirmed = await waitALPHTxConfirmed(provider, txId, BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)
        //         const { sequence, targetChain } = await getTxInfo(provider, txId)
        //         // const blockHeader = await provider.blockflow.getBlockflowHeadersBlockHash(confirmed.blockHash)
        //         // return new AlphTxInfo(blockHeader, txId, sequence, targetChain, confirmed.chainConfirmations)
        //         return { sequence, targetChain }
        //       }
        //
        //       const shouldUpdate = false
        //       const attestTokenHandlerId = getAttestTokenHandlerId(BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID, CHAIN_ID_ALEPHIUM, alephiumMainnetConfig.contracts.TokenBridge.contractInstance.groupIndex)
        //       const txInfo = await waitTxConfirmedAndGetTxInfo(nodeProvider, tx.txId)
        //       console.log("txInfo.sequence", txInfo.sequence)
        //       console.log("start")
        //       const { vaaBytes } = await getSignedVAAWithRetry(
        //         ["https://guardian-0.bridge.alephium.org"],
        //         CHAIN_ID_ALEPHIUM,
        //         BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID,
        //         CHAIN_ID_ETH,
        //         txInfo.sequence,
        //       )
        //       console.log("end")
        //       console.log("vaaBytes", vaaBytes)
        //       const signedVAA = vaaBytes ? hexToUint8Array(uint8ArrayToHex(vaaBytes)) : undefined
        //       console.log("signedVAA", signedVAA)
        //       if (signedVAA) {
        //         const result = shouldUpdate
        //           ? await updateRemoteTokenPoolOnAlph(wallet, attestTokenHandlerId, signedVAA)
        //           : await createRemoteTokenPoolOnAlph(wallet, attestTokenHandlerId, signedVAA, wallet.account.address, MINIMAL_CONTRACT_DEPOSIT)
        //         console.log("result", result)
        //       }
        //     }
        //   },
        //   errorCallback: (error) => {
        //     console.log("error", error)
        //   },
        // }, tx.txId)

        /**
         * New ------------------------------------------------------------------------
         * */
        class AlphTxInfo {
          blockHash: string
          blockHeight: number
          blockTimestamp: number
          txId: string
          sequence: string
          targetChain: ChainId
          confirmations: number

          constructor(blockHeader: node.BlockHeaderEntry, txId: string, sequence: string, targetChain: ChainId, confirmations: number) {
            this.blockHash = blockHeader.hash
            this.blockHeight = blockHeader.height
            this.blockTimestamp = blockHeader.timestamp
            this.txId = txId
            this.sequence = sequence
            this.targetChain = targetChain
            this.confirmations = confirmations
          }
        }

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

        // ----------------------------------------------------------------------------
        const ethNodeProvider = new ethers.providers.JsonRpcProvider(ETH_JSON_RPC_PROVIDER_URL)
        const signer = new ethers.Wallet(ethNetworkETHCoin!.privateKey, ethNodeProvider)

        const result = await transferLocalTokenFromAlph(
          wallet,
          BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID,
          wallet.account.address,
          ALPH_TOKEN_ID,
          CHAIN_ID_ETH,
          BRIDGE_CONSTANTS.TRANSFER_TARGET_ADDRESS_HEX,
          bAmount,
          BigInt(bridgeConfig.config.messageFee),
          0n,
          BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL,
        )

        // MAINNET
        // const result = {
        //   "fromGroup": 0,
        //   "gasAmount": 51399,
        //   "gasPrice": 100000000000n,
        //   "groupIndex": 0,
        //   "signature": "cb6457c5ab1752be16d416ff4da895be1d8cf360cfb5874efdbdfb721168544749dfa82f845f7a842df3037927f41c6b2e8a84beffefcd7e0c5ca3f951d681f5",
        //   "toGroup": 0,
        //   "txId": "9c5632e35fac916a58aefc273732db07415971c96e6b7127c6b8e726469451ba",
        //   "unsignedTx": "0000010101030001001a0c0d1440207f42f8e21128e70c7a30098a32c5c388de7eb4ffc6ef7dd86f72e8e11acc4800010a17001500626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a15007a1600a2144020000000000000000000000000000000000000000000000000000000000000000013c3038d7ea4c68000a31500626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a150014402000000000000000000000000000000000000000000000000000000000000000001340ff0e1440207f42f8e21128e70c7a30098a32c5c388de7eb4ffc6ef7dd86f72e8e11acc480013c3038d7ea4c6800016000c1404e47e01001340cd130a0c1440207f42f8e21128e70c7a30098a32c5c388de7eb4ffc6ef7dd86f72e8e11acc480001108000c8c7c1174876e80001d5b05c7dbba9ea08da2b5ef5e5e4c5109f114f6f557605ee0f11b4f642e595333be5451d000237c37e212b80fde49d8cc01179d213e9fe3cef91d04de96eec21a936d43a8f4301c4030ba33f80fe080000626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a150000000000000000000000",
        // }

        // TESTNET
        // const result = {
        //   "fromGroup": 0,
        //   "gasAmount": 55890,
        //   "gasPrice": 100000000000n,
        //   "groupIndex": 0,
        //   "signature": "ff2a2f3ef761202726e8d1a1bca5519ad1797fef3c5d4dcf66cb0da4a65587a351f10e81350144f98e03b99b5923bf807e636e98c05664d124006490b8f1a4aa",
        //   "toGroup": 0,
        //   "txId": "4057e8bb83c50d2f033b70e68fd1400d6f9be05ae55cbfe1accd153f02235278",
        //   "unsignedTx": "0001010101030001001a0c0d1440204c91e8825fcfea5219cf6a5b4f1607db7f0bd22850f39ed87dad9445bd99a800010a17001500626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a15007a1600a2144020000000000000000000000000000000000000000000000000000000000000000013c3038d7ea4c68000a31500626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a150014402000000000000000000000000000000000000000000000000000000000000000001340ff0e1440204c91e8825fcfea5219cf6a5b4f1607db7f0bd22850f39ed87dad9445bd99a80013c3038d7ea4c6800016000c1404860c0100130a130a0c1440204c91e8825fcfea5219cf6a5b4f1607db7f0bd22850f39ed87dad9445bd99a80001108000da52c1174876e80001d5b05c7dac8a50bc8bfad8e2a8c33aa4e030ed8e32d7fcbe110bd2d1802d2b5bd713dd34000237c37e212b80fde49d8cc01179d213e9fe3cef91d04de96eec21a936d43a8f4301c41b035dfbcc4da00000626147708544d0e7360952f05734b0545568feb0556b1f6404298e60b63a150000000000000000000000",
        // }

        console.log("result", result)

        const txInfo = await waitTxConfirmedAndGetTxInfo(wallet.nodeProvider, result.txId)

        // MAINNET
        // const txInfo = {
        //   "blockHash": "00000000000031ca76422171f441a00d3b1b3f4023b5e8b1de428a45f9681da0",
        //   "blockHeight": 2261892,
        //   "blockTimestamp": 1729086134831,
        //   "confirmations": 1,
        //   "sequence": "4269",
        //   "targetChain": 2,
        //   "txId": "9c5632e35fac916a58aefc273732db07415971c96e6b7127c6b8e726469451ba",
        // }

        // TESTNET
        // const txInfo = {
        //   "blockHash": "0000000c2eba2ab051dc30da557fca8b0a78d4197efe0068a297ecc3d51d4770",
        //   "blockHeight": 1317075,
        //   "blockTimestamp": 1729159372624,
        //   "confirmations": 1,
        //   "sequence": "4613",
        //   "targetChain": 2,
        //   "txId": "4057e8bb83c50d2f033b70e68fd1400d6f9be05ae55cbfe1accd153f02235278",
        // }


        console.log("txInfo", txInfo)

        console.log("waitAlphTxConfirmed [start]", BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)
        await waitAlphTxConfirmed(wallet.nodeProvider, txInfo.txId, BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)
        console.log("waitAlphTxConfirmed [end]", BRIDGE_CONSTANTS.ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL)

        console.log("getSignedVAA [start]")
        const { vaaBytes } = await getSignedVAA(
          BRIDGE_CONSTANTS.WORMHOLE_RPC_HOSTS[0],
          CHAIN_ID_ALEPHIUM,
          BRIDGE_CONSTANTS.ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID,
          CHAIN_ID_ETH,
          txInfo.sequence,
        )
        console.log("getSignedVAA [end]")
        console.log("vaaBytes", vaaBytes)

        const signedVAA = vaaBytes
        const redeemData = await redeemOnEth(
          BRIDGE_CONSTANTS.ETHEREUM_TOKEN_BRIDGE_ADDRESS,
          signer,
          signedVAA,
        )

        console.log("redeemData", redeemData)
        /**
         * New -------------------------------------------------------------------  END
         * */
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
