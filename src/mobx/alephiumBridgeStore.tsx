import { makeAutoObservable } from "mobx"

class AlephiumBridgeStore {
  totalFees: string | number = 0
  isRedeemProcessing = false
  bridgingAmount: string | number = ""
  currentTxId = ""
  chainConfirmations = 0
  signer = null
  signedVAA = null
  loadingSignedVAA = false
  isProcessingConfirmations = false

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



  resetStore() {
    this.totalFees = 0
    this.isRedeemProcessing = false
    this.loadingSignedVAA = false
    this.bridgingAmount = ""
    this.currentTxId = ""
    this.chainConfirmations = 0
    this.signer = null
    this.signedVAA = null
    this.isProcessingConfirmations = false
  }
}

const alephiumBridgeStore = new AlephiumBridgeStore()
export default alephiumBridgeStore

