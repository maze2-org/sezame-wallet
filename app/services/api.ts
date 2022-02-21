import { WalletFactory } from "@maze2/sezame-sdk"
import { IWalletAsset } from "models"

export const getBalance = async (asset: IWalletAsset) => {
  console.log(
    JSON.stringify({
      ...asset,
      contract: null,
      walletAddress: asset.address,
      privKey: asset.privateKey,
      pubKey: asset.publicKey,
    }),
  )
  const cryptoWallet = WalletFactory.getWallet({
    ...asset,
    contract: null,
    walletAddress: asset.address,
    privKey: asset.privateKey,
    pubKey: asset.publicKey,
  })
  const balance = await cryptoWallet.getBalance()
  console.log("got balance ", balance)
  return balance.confirmedBalance
}
