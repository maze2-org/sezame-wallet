import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const CurrencySelectorModel = types
  .model("CurrencySelector")
  .props({
    display: types.boolean,
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    toggle() {
      self.display = !self.display
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

type CurrencySelectorType = Instance<typeof CurrencySelectorModel>
export interface CurrencySelector extends CurrencySelectorType {}
type CurrencySelectorSnapshotType = SnapshotOut<typeof CurrencySelectorModel>
export interface CurrencySelectorSnapshot extends CurrencySelectorSnapshotType {}
export const createCurrencySelectorDefaultModel = () =>
  types.optional(CurrencySelectorModel, {
    display: false,
  })
