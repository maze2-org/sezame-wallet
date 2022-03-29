import { CoingeckoCoin } from "types/coingeckoCoin"
import axios, {CancelTokenSource} from 'axios';

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

export const getCoinPrices = (ids, signal?: CancelTokenSource): Promise<Array<any>> => {
  return axios

    .get(
      coingeckoBaseUrl +
        "/coins/markets?vs_currency=usd&ids=" +
        ids +
        "&order=market_cap_desc&per_page=10&page=1&sparkline=false",
    { cancelToken: signal.token})
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
