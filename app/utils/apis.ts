import { CoingeckoCoin } from "types/coingeckoCoin"

const axios = require("axios")

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

export const getCoinPrices = (ids): Promise<Array<any>> => {
  return axios

    .get(
      coingeckoBaseUrl +
        "/coins/markets?vs_currency=usd&ids=" +
        ids +
        "&order=market_cap_desc&per_page=10&page=1&sparkline=false",
    )
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
