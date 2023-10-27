import { WalletFactory } from "@maze2/sezame-sdk"
import { asCreateObservableOptions } from "mobx/dist/internal"
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
  reason?: "transaction" | "staking" | "unstaking" | "withdraw"
}

const tokens = require("../../config/tokens.json")

export type AssetBalance = {
  confirmedBalance: number
  unconfirmedBalance: number
  stakedBalance?: number
  unlockedBalance?: number
  unstakedBalance?: number
  freeBalance?: number
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
export const getBalance = async (asset: IWalletAsset): Promise<AssetBalance> => {
  const tokenInfo = tokens.find((token) => token.id === asset.cid)
  const assetInfo = tokenInfo.chains.find((chain) => chain.id === asset.chain)
  asset.decimals = assetInfo.decimals

  const cryptoWallet = getWallet(asset)
  const balance = await cryptoWallet.getBalance()

  return balance
}

export const getTransactionsUrl = (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  const url = cryptoWallet.getTransactionsUrl(cryptoWallet.address)
  return url
}

export const getTransactionStatus = (asset: IWalletAsset, txId: string) => {
  console.log("Starting to get transaction status of", asset, txId)
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

export const makeWithdrawal = (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  return cryptoWallet.withdrawUnlocked()
}

export const getStakingProperties = (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  return cryptoWallet.getStakingProperties(asset.address)
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
