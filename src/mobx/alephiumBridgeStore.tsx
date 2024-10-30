import { makeAutoObservable } from "mobx"
import { ethers } from "ethers"

class AlephiumBridgeStore {
  isTransferringFromALPH: boolean = false
  totalFees: string | number = 0
  isRedeemProcessing = false
  bridgingAmount: string | number = ""
  currentTxId = ""
  chainConfirmations = 0
  signer = null
  signedVAA = null
  loadingSignedVAA = false
  isProcessingConfirmations = false
  isApprovingEth: boolean = false
  approvedEthResult: any = null
  isTransferringFromETH: boolean = false
  receipt: ethers.ContractReceipt | null = null

  constructor() {
    makeAutoObservable(this)
  }

  setBridgingAmount(bridgingAmount: string | number) {
    this.bridgingAmount = bridgingAmount
  }

  setCurrentConfirmations(confirmations: number) {
    this.chainConfirmations = confirmations
  }

  setCurrentTxId(txId: string) {
    this.currentTxId = txId
  }

  setIsProcessingConfirmations(isProcessingConfirmations: boolean) {
    this.isProcessingConfirmations = isProcessingConfirmations
  }

  setSigner(signer: any) {
    this.signer = signer
  }

  setSignedVAA(signedVAA: any) {
    this.signedVAA = signedVAA
  }

  setLoadingSignedVAA(loading: boolean) {
    this.loadingSignedVAA = loading
  }

  setIsRedeemProcessing(loading: boolean) {
    this.isRedeemProcessing = loading
  }

  setTotalFees(fees: string | number) {
    this.totalFees = fees
  }

  setIsTransferringFromALPH(isTransferringFromALPH: boolean) {
    this.isTransferringFromALPH = isTransferringFromALPH
  }

  setIsApprovingEth(isApprovingEth: boolean) {
    this.isApprovingEth = isApprovingEth
  }

  setApprovedEthResult(result: any) {
    this.approvedEthResult = result
  }

  setIsTransferringFromETH(isTransferringFromETH: boolean) {
    this.isTransferringFromETH = isTransferringFromETH
  }

  setReceipt(receipt: ethers.ContractReceipt) {
    this.receipt = receipt
  }

  resetStore() {
    this.totalFees = 0
    this.isTransferringFromALPH = false
    this.isRedeemProcessing = false
    this.loadingSignedVAA = false
    this.bridgingAmount = ""
    this.currentTxId = ""
    this.chainConfirmations = 0
    this.signer = null
    this.signedVAA = null
    this.isProcessingConfirmations = false
    this.isApprovingEth = false
    this.approvedEthResult = null
    this.isTransferringFromETH = false
    this.receipt = null
  }
}

const alephiumBridgeStore = new AlephiumBridgeStore()
export default alephiumBridgeStore

