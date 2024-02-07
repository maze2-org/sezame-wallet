import { CONFIG } from "@maze2/sezame-sdk"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { createWalletConnectDefaultModel } from "models/wallet-connect/wallet-connect"
import {
  createCurrencySelectorDefaultModel,
  CurrencySelectorModel,
} from "models/currency-selector/currency-selector"
import { createCurrentWalletDefaultModel } from "models/current-wallet/current-wallet"
import { createPendingTransactionsDefaultModel } from "models/pending-transactions/pending-transactions"
import { createExchangeRateDefaultModel } from "models/exchange-rate/exchange-rate"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  currentWalletStore: createCurrentWalletDefaultModel(),
  currencySelectorStore: createCurrencySelectorDefaultModel(),
  pendingTransactions: createPendingTransactionsDefaultModel(),
  exchangeRates: createExchangeRateDefaultModel(),
  TESTNET: types.optional(types.boolean, CONFIG.TESTNET),
  walletConnectStore: createWalletConnectDefaultModel(),
  overlayLoadingShown: types.optional(types.boolean, false),
}).actions(self => ({
  setTestnet(value: boolean) {
    self.TESTNET = value;
    CONFIG.setTESTNET(value);
  },
  setOverlayLoadingShown(value: boolean) {
    self.overlayLoadingShown = value;
  }
}))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> { }

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> { }
