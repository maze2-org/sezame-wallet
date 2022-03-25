import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { WALLET_CONNECT_STATUS } from "services/walletconnect"

/**
 * Model description here for TypeScript hints.
 */
export const WalletConnectModel = types
  .model("WalletConnect")
  .props({
    peerMeta: types.optional(
      types.model({
        url: types.string,
        description: types.string,
        icons: types.array(types.string),
        name: types.string,
      }),
      {
        url: "",
        description: "",
        icons: [],
        name: "",
      },
    ),
    chainId: types.optional(types.string, ""),
    status: types.optional(types.string, WALLET_CONNECT_STATUS.DISCONNECTED),
    transactionData: types.optional(
      types.model({
        id: types.string,
        params: types.array(types.string),
      }),
      { id: "", params: [] },
    ),
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setPeerMeta(value) {
      self.peerMeta = value
    },

    setChainId(value) {
      self.chainId = value
    },

    setStatus(value: string) {
      self.status = value
    },

    setTransactionData(value) {
      self.transactionData = value
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

type WalletConnectType = Instance<typeof WalletConnectModel>
export interface WalletConnect extends WalletConnectType {}
type WalletConnectSnapshotType = SnapshotOut<typeof WalletConnectModel>
export interface WalletConnectSnapshot extends WalletConnectSnapshotType {}
export const createWalletConnectDefaultModel = () => types.optional(WalletConnectModel, {})
