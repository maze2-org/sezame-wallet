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

  return balance.confirmedBalance
}

export const getFees = async (asset: IWalletAsset, address: string, amount: number) => {
  const cryptoWallet = getWallet(asset)
  const fees = await cryptoWallet.getTxSendProposals(address, amount)
  return fees
}
export const makeSendTransaction = async (asset: IWalletAsset, fees) => {
  const cryptoWallet = getWallet(asset)
  const transaction = await cryptoWallet.postTxSend(fees)
  return transaction
}
