import { WalletFactory } from "@maze2/sezame-sdk"
import { IWalletAsset } from "models"

export type CryptoTransaction = {
  date: Date | null
  timestamp: number
  out: boolean
  hash: string
  from: string[] | string
  to: string[] | string
  amount: string
}

const getWallet = (asset) => {
  console.log("GET WALLET", {
    ...asset,
    walletAddress: asset.address,
    privKey: asset.privateKey,
    pubKey: asset.publicKey,
  })

  const cryptoWallet = WalletFactory.getWallet({
    ...asset,
    contract: asset.contract ? asset.contract : null,
    walletAddress: asset.address,
    privKey: asset.privateKey,
    pubKey: asset.publicKey,
  })

  return cryptoWallet
}
export const getBalance = async (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  const balance = await cryptoWallet.getBalance()
  return balance.confirmedBalance
}

export const getTransactionsUrl = (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  const url = cryptoWallet.getTransactionsUrl(cryptoWallet.address)
  return url
}

export const getTransactionStatus = (asset: IWalletAsset, txId: string) => {
  const cryptoWallet = getWallet(asset)
  return cryptoWallet.getTransactionStatus(txId)
}

export const getTransactions = async (asset: IWalletAsset): Promise<Array<CryptoTransaction>> => {
  const cryptoWallet = getWallet(asset)
  return await cryptoWallet.getTransactions()
}

export const getFees = async (asset: IWalletAsset, address: string, amount: number) => {
  const cryptoWallet = getWallet(asset)
  const fees = await cryptoWallet.getTxSendProposals(address, amount)
  return fees
}
export const getTransactionDriver = async (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  const driver = cryptoWallet.TRANSACTION_DRIVER_NAMESPACE[asset.chain + "_Driver"]
  return driver
}
export const makeSendTransaction = (asset: IWalletAsset, proposal) => {
  const cryptoWallet = getWallet(asset)
  return cryptoWallet.postTxSend(proposal)
}
export const makeRawTransaction = async (asset: IWalletAsset, data) => {
  const driver = await getTransactionDriver(asset)
  const rawTransaction = await driver.prepareSignedTransaction(data)
  return rawTransaction
}
export const sendRawTransaction = async (asset: IWalletAsset, rawTransaction) => {
  const driver = await getTransactionDriver(asset)
  const hash = await driver.sendRaw(rawTransaction)
  return hash
}
