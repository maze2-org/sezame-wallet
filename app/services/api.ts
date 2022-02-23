import { WalletFactory } from "@maze2/sezame-sdk"

import { IWalletAsset } from "models"
const getWallet = (asset) => {
  const cryptoWallet = WalletFactory.getWallet({
    ...asset,
    contract: null,
    walletAddress: asset.address,
    privKey: asset.privateKey,
    pubKey: asset.publicKey,
  })

  return cryptoWallet
}
export const getBalance = async (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  const balance = await cryptoWallet.getBalance()
  console.log("got balance ", balance)
  return balance.confirmedBalance
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
export const makeSendTransaction = async (asset: IWalletAsset, proposal) => {
  const cryptoWallet = getWallet(asset)
  const transaction = await cryptoWallet.postTxSend(proposal)
  return transaction
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
