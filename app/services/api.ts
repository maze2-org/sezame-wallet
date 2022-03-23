import { WalletFactory } from "@maze2/sezame-sdk"
import { IWalletAsset } from "models"

export type CryptoTransaction = {
  date: Date
  hash: string
  from: string
  to: string
  amount: number
}

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

export const getTransactionsUrl = (asset: IWalletAsset) => {
  const cryptoWallet = getWallet(asset)
  const url = cryptoWallet.getTransactionsUrl(cryptoWallet.address)
  console.log("GOT URLLLLLLLLLLLLL", { url })
  return url
}

export const getTransactions = async (asset: IWalletAsset): Promise<Array<CryptoTransaction>> => {
  const cryptoWallet = getWallet(asset)
  return await cryptoWallet.getTransactions()
  // Returning fake data
  // return [
  //   {
  //     date: new Date(),
  //     hash: "bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e",
  //     from: "bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e",
  //     to: "5GzrBLTUs4EEovTAVXLMiSw9JYkSBTih8FurD8xYe9GvhZs9",
  //     amount: 20,
  //   },

  //   {
  //     date: new Date(),
  //     hash: "bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e",
  //     from: "5GzrBLTUs4EEovTAVXLMiSw9JYkSBTih8FurD8xYe9GvhZs9",
  //     to: "bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e",
  //     amount: 21,
  //   },

  //   {
  //     date: new Date(),
  //     hash: "bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e",
  //     from: "5GzrBLTUs4EEovTAVXLMiSw9JYkSBTih8FurD8xYe9GvhZs9",
  //     to: "bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e",
  //     amount: 22,
  //   },
  // ]
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
