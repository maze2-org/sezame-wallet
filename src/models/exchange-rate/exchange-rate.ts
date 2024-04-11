import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { IWalletAsset } from "models/current-wallet/current-wallet"
import { getCoinPrices } from "utils/apis"

const CurrencyPair = types.model({
  currency: types.string,
  usdEquivalent: types.number,
})
/**
 * Model description here for TypeScript hints.
 */
export const ExchangeRateModel = types
  .model("ExchangeRate")
  .props({
    currencyPairs: types.map(CurrencyPair),
    refreshingRates: types.boolean,
  })
  .views((self) => ({
    getRate: (id) => {
      if (self.currencyPairs.has(id)) {
        return self.currencyPairs.get(id).usdEquivalent
      }
      return 0
    },
    getTotal(assets: IWalletAsset[] | null) {
      if (!assets) {
        return 0
      }

      let total = 0
      for (const asset of assets) {
        const usd = self.currencyPairs.get(asset.cid)?.usdEquivalent || 0
        total += asset.balanceWithDerivedAddresses * usd
      }
      return total
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    addCurrencies: flow(function* addCurrency(ids: string[]) {
      /**
       * Add some currencies to the exchange store and get their exchange rates
       * @param currency Should be the cid (ie: bitcoin, ethereum, etc.)
       */
      try {
        // First check if there are new currencies
        if (!ids.filter((id) => !self.currencyPairs.has(id)).length) {
          return
        }

        self.refreshingRates = true
        const coinPrices = yield getCoinPrices(ids.join(","))

        for (const coinId of Object.keys(coinPrices)) {
          self.currencyPairs.set(coinId, {
            currency: coinId,
            usdEquivalent: coinPrices[coinId]?.usd || 0,
          })
        }
      } catch (e) {
        console.error(e)
      }
      self.refreshingRates = false
    }),
    refreshCurrencies: flow(function* refreshCurrencies() {
      self.refreshingRates = true

      const ids = Array.from(self.currencyPairs.values()).map((row) => row.currency)

      try {
        const coinPrices = yield getCoinPrices(ids.join(","))
        for (const coinId of Object.keys(coinPrices)) {
          self.currencyPairs.set(coinId, {
            currency: coinId,
            usdEquivalent: coinPrices[coinId]?.usd || 0,
          })
        }
      } catch (e) {
        console.error(e)
      }

      self.refreshingRates = false
    }),
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

type ExchangeRateType = Instance<typeof ExchangeRateModel>
export interface ExchangeRate extends ExchangeRateType {}
type ExchangeRateSnapshotType = SnapshotOut<typeof ExchangeRateModel>
export interface ExchangeRateSnapshot extends ExchangeRateSnapshotType {}
export const createExchangeRateDefaultModel = () =>
  types.optional(ExchangeRateModel, {
    currencyPairs: {},
    refreshingRates: false,
  })
