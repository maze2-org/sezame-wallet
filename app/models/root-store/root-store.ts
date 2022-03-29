import { CONFIG } from "@maze2/sezame-sdk"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { createWalletConnectDefaultModel } from "models/wallet-connect/wallet-connect"
import {
  createCurrencySelectorDefaultModel,
  CurrencySelectorModel,
} from "models/currency-selector/currency-selector"
import {
  createCurrentWalletDefaultModel,
  CurrentWalletModel,
} from "models/current-wallet/current-wallet"
import { createPendingTransactionsDefaultModel } from "models/pending-transactions/pending-transactions"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  currentWalletStore: createCurrentWalletDefaultModel(),
  currencySelectorStore: createCurrencySelectorDefaultModel(),
  pendingTransactions: createPendingTransactionsDefaultModel(),
  TESTNET: types.optional(types.boolean, CONFIG.TESTNET),
  walletConnectStore: createWalletConnectDefaultModel(),
}).actions(self => ({
  setTestnet(value: boolean) {
    self.TESTNET = value;
    CONFIG.setTESTNET(value);
  } 
}))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
