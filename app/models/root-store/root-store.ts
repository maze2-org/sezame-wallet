import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { CurrentWalletModel } from "models/current-wallet/current-wallet"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  currentWalletStore: types.optional(CurrentWalletModel, {} as any),

})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
