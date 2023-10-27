import { NetworkType } from "config/networks"
import { flow, Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { remove } from "utils/storage"
import { StoredWallet } from "../../utils/stored-wallet"
import { AssetBalance, getBalance } from "services/api"
import { Chains, WalletGenerator } from "@maze2/sezame-sdk"

const WalletAsset = types.model({
  name: types.string,
  chain: types.string,
  publicKey: types.string,
  privateKey: types.string,
  address: types.string,
  symbol: types.string,
  type: types.string,
  cid: types.optional(types.string, ""),
  contract: types.maybeNull(types.string),
  balance: types.optional(types.number, 0),
  stakedBalance: types.optional(types.number, 0),
  freeBalance: types.optional(types.number, 0),
  unconfirmedBalance: types.optional(types.number, 0),
  unlockedBalance: types.optional(types.number, 0),
  unstakedBalance: types.optional(types.number, 0),
  value: types.optional(types.number, 0),
  rate: types.optional(types.number, 0),
  version: types.optional(types.number, 0),
  image: types.optional(types.string, ""),
  decimals: types.optional(types.number, 8),
})
export type IWalletAsset = Instance<typeof WalletAsset>

const sleep = async (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

/**
 * Model description here for TypeScript hints.
 */
export const CurrentWalletModel = types
  .model("CurrentWallet")
  .props({
    wallet: types.maybe(types.string),
    name: types.maybe(types.string),
    assets: types.array(WalletAsset),
    loadingBalance: types.boolean,
    updatingAssets: types.boolean,
  })
  .views((self) => ({
    getWallet: () => {
      if (self.wallet) {
        return StoredWallet.loadFromJson(JSON.parse(self.wallet))
      }
      return null
    },
    getAssets: async () => {
      return self.assets
    },
    getAssetById: (cid: string, chain?: string) => {
      return self.assets.find(
        (a) => (!chain && a.cid === cid) || (chain && a.cid === cid && a.chain === chain),
      )
    },
    getAssetsById: (cid: string, chain?: string) => {
      return self.assets.filter(
        (a) => (!chain && a.cid === cid) || (chain && a.cid === cid && a.chain === chain),
      )
    },
    getAssetByChain: (chain: string) => {
      return self.assets.find((a) => a.chain === chain)
    },
    getWalletAddressByChain: (chain: string) => {
      const asset = self.assets.find((a) => a.chain === chain)
      if (asset) {
        return asset.address
      }
      return ""
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    addAutoAsset: flow(function* (asset: any) {
      self.updatingAssets = true
      const existingAsset: IWalletAsset = self.assets.find((currentAsset) => {
        return asset.chain === currentAsset.chain
      })

      yield sleep(100)

      const wallet: StoredWallet = yield StoredWallet.loadFromJson(JSON.parse(self.wallet))

      try {
        if (
          existingAsset &&
          existingAsset.publicKey &&
          existingAsset.privateKey &&
          existingAsset.address
        ) {
          self.assets.push({
            ...asset,
            publicKey: existingAsset.publicKey,
            privateKey: existingAsset.privateKey,
            address: existingAsset.address,
          })
        } else {
          const newAsset = yield WalletGenerator.generateKeyPairFromMnemonic(
            wallet.mnemonic,
            asset.chain as Chains,
            0,
          )
          self.assets.push({
            ...asset,
            publicKey: newAsset.publicKey,
            privateKey: newAsset.privateKey,
            address: newAsset.address,
          })
        }

        wallet.assets = self.assets
        self.wallet = JSON.stringify(wallet.toJson())
        yield wallet.save()
      } catch (ex) {
        console.error(ex)
      } finally {
        self.updatingAssets = false
      }
    }),

    removeAsset: flow(function* (chainId: string, symbol: string) {
      self.updatingAssets = true
      yield sleep(50)

      try {
        self.assets.replace(
          self.assets.filter((asset) => {
            console.log("SHOULD BE KEPT ??", asset.chain, chainId, asset.symbol, symbol)
            return (
              asset.chain?.toLowerCase() !== chainId?.toLowerCase() ||
              asset.symbol?.toLowerCase() !== symbol?.toLowerCase()
            )
          }),
        )

        const wallet: StoredWallet = yield StoredWallet.loadFromJson(JSON.parse(self.wallet))
        wallet.assets = self.assets
        self.wallet = JSON.stringify(wallet.toJson())

        yield wallet.save()
      } catch (e) {
        console.log(e)
      } finally {
        self.updatingAssets = false
      }
    }),

    hasAsset: (network: NetworkType): boolean => {
      return (
        self.assets.filter((asset) => {
          return asset.name === network.name
        }).length > 0
      )
    },

    resetBalance: () => {
      const wallet = JSON.parse(self.wallet)

      for (let asset of self.assets) {
        asset = {
          ...asset,
          balance: 0,
          stakedBalance: 0,
          freeBalance: 0,
          unconfirmedBalance: 0,
          unlockedBalance: 0,
          unstakedBalance: 0,
        }
      }

      wallet.assets = self.assets
      self.wallet = JSON.stringify(wallet)
    },

    open: (wallet: StoredWallet) => {
      self.wallet = JSON.stringify(wallet.toJson())
      self.assets.clear()
      const assets = wallet.toJson().assets

      for (const asset of assets) {
        self.assets.push(asset)
      }
      // self.assets.replace(wallet.toJson().assets as any)
      self.name = wallet.toJson().walletName
    },
    close: () => {
      self.wallet = undefined
      self.assets.clear()
      self.name = ""
    },
    setBalance: (asset, assetBalance: AssetBalance) => {
      const storedAsset = self.assets.find(
        (a) => a.symbol === asset.symbol && a.chain === asset.chain,
      )
      storedAsset.balance = assetBalance.confirmedBalance
      storedAsset.stakedBalance = assetBalance.stakedBalance
      storedAsset.freeBalance = assetBalance.freeBalance
      storedAsset.unconfirmedBalance = assetBalance.unconfirmedBalance
      storedAsset.unlockedBalance = assetBalance.unlockedBalance
      storedAsset.unstakedBalance = assetBalance.unstakedBalance
    },
    stopLoading: () => {
      self.loadingBalance = false
    },
    refreshBalances: flow(function* refreshBalances() {
      self.loadingBalance = true

      for (let asset of self.assets) {
        try {
          const balance = yield getBalance(asset)
          asset.balance = balance.confirmedBalance
          asset.stakedBalance = balance.stakedBalance
          asset.freeBalance = balance.freeBalance
          asset.unconfirmedBalance = balance.unconfirmedBalance
          asset.unlockedBalance = balance.unlockedBalance
          asset.unstakedBalance = balance.unstakedBalance
        } catch (error) {
          console.error({ error })
        }
      }
      self.loadingBalance = false
    }),

    removeWallet: async () => {
      let deleted = null
      try {
        deleted = await remove(self.name)
      } catch (error) {
        console.log("Error removing wallet", error)
      }
      return deleted
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export const currentWalletStore = CurrentWalletModel.create({
  wallet: undefined, // the type here is different from the type in the actual model
  loadingBalance: false,
  updatingAssets: false,
})

type CurrentWalletType = Instance<typeof CurrentWalletModel>
export interface CurrentWallet extends CurrentWalletType {}
type CurrentWalletSnapshotType = SnapshotOut<typeof CurrentWalletModel>
export interface CurrentWalletSnapshot extends CurrentWalletSnapshotType {}
export const createCurrentWalletDefaultModel = () =>
  types.optional(CurrentWalletModel, {
    wallet: undefined,
    loadingBalance: false,
    updatingAssets: false,
  })
