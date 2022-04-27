import { Instance, SnapshotOut, types, flow, destroy } from "mobx-state-tree"
import { IWalletAsset } from "models/current-wallet/current-wallet"
import { load, save } from "utils/storage"

export type PendingTransaction = {
  walletId?: string
  txId: string
  from: string
  to: string
  amount: string
  timestamp: number
  reason?: "transaction" | "staking" | "unstaking" | "withdraw"
  status?: string | null
}

const PendingTranactionModel = types.model({
  walletId: types.string,
  txId: types.string,
  from: types.string,
  to: types.string,
  amount: types.string,
  timestamp: types.number,
  reason: types.string,
  status: types.maybe(types.string),
})
/**
 * Model description here for TypeScript hints.
 */
export const PendingTransactionsModel = types
  .model("PendingTransactions")
  .props({
    transactions: types.array(PendingTranactionModel),
    updated: types.number,
  })
  .views((self) => ({
    getPendingTxsForAsset: (asset: IWalletAsset): PendingTransaction[] => {
      if (!asset) {
        return []
      }

      return self.transactions.filter((a) => {
        const walletId = `${asset.chain}${asset.symbol}${asset.cid}`
        return walletId === a.walletId
      }) as any
    },
  }))
  .actions((self) => ({
    open: flow(function* open() {
      const data = yield load("pendingTxs")
      self.transactions = data || []
    }),

    add: flow(function* (asset: IWalletAsset, tx: PendingTransaction) {
      tx.walletId = `${asset.chain}${asset.symbol}${asset.cid}`
      self.transactions.push(tx)
      yield save("pendingTxs", self.transactions)
    }),
    clear: flow(function* () {
      self.transactions.clear()
      yield save("pendingTxs", self.transactions)
    }),
    update: flow(function* (tx: PendingTransaction, updatedTx: Partial<PendingTransaction>) {
      self.transactions.forEach((transaction, index) => {
        if (transaction.txId === tx.txId) {
          self.transactions[index].status = updatedTx.status
        }
      })
      yield save("pendingTxs", self.transactions)
    }),
    remove: flow(function* (asset: IWalletAsset, tx: PendingTransaction) {
      tx.walletId = `${asset.chain}${asset.symbol}${asset.cid}`

      self.transactions.replace(
        self.transactions.filter((currentTx, i) => {
          return !(tx.walletId === currentTx.walletId && tx.txId === currentTx.txId)
        }),
      )

      yield save("pendingTxs", self.transactions)
    }),
  }))

type PendingTransactionsType = Instance<typeof PendingTransactionsModel>
export interface PendingTransactions extends PendingTransactionsType {}
type PendingTransactionsSnapshotType = SnapshotOut<typeof PendingTransactionsModel>
export interface PendingTransactionsSnapshot extends PendingTransactionsSnapshotType {}
export const createPendingTransactionsDefaultModel = () =>
  types.optional(PendingTransactionsModel, {
    transactions: [],
    updated: 0,
  })
