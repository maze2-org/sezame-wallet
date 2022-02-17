import { Chains, WalletGenerator } from "@maze2/sezame-sdk"
import { decrypt, encrypt } from "./encryption"
import { loadString, saveString } from "./storage"

export interface WalletAsset {
  chain: string
  publicKey: string
  privateKey: string
  address: string
}

export interface WalletJson {
  walletName: string
  mnemonic: string
  password: string
  assets: Array<WalletAsset>
}

export class StoredWallet {
  mnemonic: string
  password: string
  walletName: string
  assets: Array<WalletAsset>
  creationDate: Date

  constructor(walletName: string, mnemonic: string, password: string, assets?: Array<WalletAsset>) {
    this.walletName = walletName
    this.mnemonic = mnemonic
    this.creationDate = new Date()
    this.password = password

    this.assets = []
    if (assets) {
      this.assets = assets
    }
  }

  static async loadFromStorage(walletName: string, password: string) {
    try {
      const encryptedData = await loadString(`wallet_${walletName}`)
      const walletData: WalletJson = JSON.parse(decrypt(password, encryptedData))

      const storedWallet = new StoredWallet(
        walletData.walletName,
        walletData.mnemonic,
        password,
        walletData.assets,
      )
      return storedWallet
    } catch (err) {
      throw new Error("Unable to open this wallet")
    }
  }

  static async loadFromJson(json: WalletJson) {
    return new StoredWallet(json.walletName, json.mnemonic, json.password, json.assets)
  }

  addAsset(asset: WalletAsset) {
    this.assets.push(asset)
  }

  async addAutoAsset(chain: string) {
    try {
      const wallet = await WalletGenerator.generateKeyPairFromMnemonic(
        this.mnemonic,
        chain as Chains,
        0,
      )
      this.addAsset({
        chain,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        address: wallet.address,
      })
    } catch (e) {
      throw new Error(`${chain} block chain is not supported yet: ` + e)
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
    return saveString(
      `wallet_${this.walletName}`,
      encrypt(this.password, JSON.stringify(this.toJson())),
    )
  }
}
