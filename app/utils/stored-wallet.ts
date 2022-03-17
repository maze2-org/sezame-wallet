import { Chains, WalletGenerator } from "@maze2/sezame-sdk"
import { IWalletAsset } from "models/current-wallet/current-wallet"
import { decrypt, encrypt } from "./encryption"
import { loadEncryptedWallet, loadString, remove, saveWallet } from "./storage"

export interface WalletJson {
  walletName: string
  mnemonic: string
  password: string
  assets: Array<IWalletAsset>
}

export class StoredWallet {
  mnemonic: string
  password: string
  walletName: string
  assets: Array<IWalletAsset> = []
  creationDate: Date

  constructor(walletName: string, mnemonic: string, password: string) {
    this.walletName = walletName
    this.mnemonic = mnemonic
    this.creationDate = new Date()
    this.password = password
  }

  static async loadFromStorage(walletName: string, password: string) {
    try {
      const encryptedData = await loadEncryptedWallet(`${walletName}`)
      const walletData: WalletJson = JSON.parse(decrypt(password, encryptedData))
      const storedWallet = new StoredWallet(walletData.walletName, walletData.mnemonic, password)
      await storedWallet.addAssets(walletData.assets)
      return storedWallet
    } catch (err) {
      console.log(err)
      throw new Error("Unable to open this wallet")
    }
  }

  static async loadFromJson(json: WalletJson) {
    const wallet = new StoredWallet(json.walletName, json.mnemonic, json.password)
    await wallet.addAssets(json.assets)
    return wallet
  }

  addAsset(asset: IWalletAsset) {
    this.assets.push(asset)
  }

  async addAutoAsset(asset: IWalletAsset) {
    try {
      const wallet = await WalletGenerator.generateKeyPairFromMnemonic(
        this.mnemonic,
        asset.chain as Chains,
        0,
      )
      this.addAsset({
        ...asset,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        address: wallet.address,
      })
    } catch (e) {
      throw new Error(`${asset.chain} block chain is not supported yet: ` + e)
    }
  }

  toJson(): WalletJson {
    return {
      walletName: this.walletName,
      mnemonic: this.mnemonic,
      assets: this.assets,
      password: this.password,
    }
  }

  async save() {
    return await saveWallet(
      `${this.walletName}`,
      encrypt(this.password, JSON.stringify(this.toJson())),
    )
  }

  async remove() {
    await remove(this.walletName)
  }

  public async addAssets(assets) {
    await Promise.all(assets.map(async (asset) => this.addAutoAsset(asset)))
  }

  public async changePassword(oldPassword, newPassword) {
    try {
      const encryptedData = await loadEncryptedWallet(`${this.walletName}`)
      JSON.parse(decrypt(oldPassword, encryptedData))
      this.password = newPassword
      this.save()
    } catch (error) {
      throw new Error("Unable to change password")
    }
  }
}
