import { CoingeckoCoin } from "types/coingeckoCoin"
import axios, { CancelTokenSource } from "axios"

const coingeckoBaseUrl = "https://api.coingecko.com/api/v3"
export const getCoinDetails = (symbol): Promise<CoingeckoCoin> => {
  return axios

    .get(coingeckoBaseUrl + "/coins/" + symbol + "?sparkline=true")
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      return error
    })
}

export const getCoinPrices = (
  ids,
  signal?: CancelTokenSource,
): Promise<{ [key: string]: { usd?: number } }> => {
  if (!ids) {
    return Promise.resolve({})
  }

  const url = coingeckoBaseUrl + `/simple/price?vs_currencies=usd&ids=${ids}`

  return axios
    .get(url, { cancelToken: signal ? signal.token : null })
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      return error
    })
}

export const getMarketChart = (id, days): Promise<any> => {
  return axios

    .get(coingeckoBaseUrl + "/coins/" + id + "/market_chart?vs_currency=usd&days=" + days)
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      return error
    })
}
