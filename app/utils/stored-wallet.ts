import { Chains, WalletGenerator } from "@maze2/sezame-sdk"
import { IWalletAsset } from "models/current-wallet/current-wallet"
import { defaultAssets } from "./consts"
import { decrypt, encrypt } from "./encryption"
import { loadString, saveString } from "./storage"

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
      const encryptedData = await loadString(`${walletName}`, "wallets")
      const walletData: WalletJson = JSON.parse(decrypt(password, encryptedData))
      const storedWallet = new StoredWallet(walletData.walletName, walletData.mnemonic, password)
      await storedWallet.addAssets(walletData.assets)
      return storedWallet
    } catch (err) {
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

  save() {
    console.log("save wallet ", JSON.stringify(this.toJson()), this.toJson().assets)
    return saveString(
      `${this.walletName}`,
      encrypt(this.password, JSON.stringify(this.toJson())),
      "wallets",
    )
  }

  public async addAssets(assets) {
    await Promise.all(assets.map(async (asset) => this.addAutoAsset(asset)))
  }
}
