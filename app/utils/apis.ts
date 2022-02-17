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
