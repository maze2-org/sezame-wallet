import { types } from "mobx-state-tree"
import { StoredWallet } from "../../utils/stored-wallet"

/**
 * Model description here for TypeScript hints.
 */
export const CurrentWalletModel = types
  .model("CurrentWallet")
  .props({
    wallet: types.maybe(types.string),
  })
  .views((self) => ({
    getWallet: () => {
      if (self.wallet) {
        return StoredWallet.loadFromJson(JSON.parse(self.wallet))
      }
      return null
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    open: (wallet: StoredWallet) => {
      self.wallet = JSON.stringify(wallet.toJson())
    },
    close: () => {
      self.wallet = null
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export const currentWalletStore = CurrentWalletModel.create({
  wallet: undefined, // the type here is different from the type in the actual model
})
