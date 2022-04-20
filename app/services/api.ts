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
  status?: string | null
  reason?: "transaction" | "staking" | "unstaking"
}

const getWallet = (asset) => {
  const cryptoWallet = WalletFactory.getWallet({
    ...asset,
    contract: asset.contract ? asset.contract : null,
    walletAddress: asset.address,
    privKey: asset.privateKey,
    pubKey: asset.publicKey,
  })

  return cryptoWallet
}
export const getBalance = async (
  asset: IWalletAsset,
): Promise<{ confirmedBalance: number; stakedBalance: number }> => {
  const cryptoWallet = getWallet(asset)
  const balance = await cryptoWallet.getBalance()

  console.log("GOTBALANCEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE", balance)
  return balance
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

export const getFees = async (
  asset: IWalletAsset,
  address: string,
  amount: number,
  reason?: "transfer" | "staking" | "unstaking" | "lowering" | "lifting",
) => {
  const cryptoWallet = getWallet(asset)
  const fees = await cryptoWallet.getTxSendProposals(address, amount, reason)
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

export const makeStakeTransaction = (asset: IWalletAsset, proposal) => {
  const cryptoWallet = getWallet(asset)
  return cryptoWallet.stake(proposal)
}

export const makeUnstakeTransaction = (asset: IWalletAsset, proposal) => {
  const cryptoWallet = getWallet(asset)
  return cryptoWallet.unstake(proposal)
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
