import { CoingeckoCoin } from 'types/coingeckoCoin';
import axios, { CancelTokenSource } from 'axios';
const tokens = require("@config/tokens.json")

type TokenDetailsChain = {
  "id": string,
  "name": string,
  "contract": string,
  "decimals": number,
  "capabilities": string[]
}
type TokenDetails = {
  "id": string,
  "name": string,
  "symbol": string,
  "type": string,
  "chains": TokenDetailsChain,
  "thumb": string
};

const coingeckoBaseUrl = 'https://coingecko.sezame.app/api/v3';
const mexcBaseUrl = "https://api.mexc.com"

const cache = new Map();

// Fonction pour récupérer les données mises en cache ou effectuer une requête et mettre en cache les résultats
const fetchWithCache = (url: string, expiration: number) => {
  // Vérifier si les données sont en cache et si elles ne sont pas expirées
  const cachedData = cache.get(url);
  if (cachedData && Date.now() - cachedData.timestamp < expiration) {
    return Promise.resolve(cachedData.data);
  }

  // Si les données ne sont pas en cache ou sont expirées, effectuer la requête
  return axios
    .get(url)
    .then(response => {
      const data = response.data;
      // Mettre en cache les résultats
      cache.set(url, { data, timestamp: Date.now() });
      return data;
    })
    .catch(error => {
      throw error;
    });
};

/**
 * Return the data coming from coingecko (name and image) or from fromthe tokens.json file as a fallback.
 * When fallback is used, there is no high resolution images
 *
 * @param symbol
 * @returns
 */
export const getCoinDetails = async (symbol: string): Promise<Partial<CoingeckoCoin> | null> => {
  const url = coingeckoBaseUrl + '/coins/' + symbol + '?sparkline=true';
  try {
    const coingeckoData = await fetchWithCache(url, 600000);
    return coingeckoData;
  }
  catch (err: any) {
    const coinDetail: TokenDetails = tokens.find((t: TokenDetails) => t.id === symbol);
    if (coinDetail) {
      return {
        name: coinDetail.name,
        image: {
          large: coinDetail.thumb,
          small: coinDetail.thumb,
          thumb: coinDetail.thumb,
        }
      }
    }
  }

  return null;
};

export const getCoinPrices = (
  ids: string,
  signal?: CancelTokenSource,
): Promise<{ [key: string]: { usd?: number } }> => {
  if (!ids) {
    return Promise.resolve({});
  }

  const url = coingeckoBaseUrl + `/simple/price?vs_currencies=usd&ids=${ids}`;
  return fetchWithCache(url, 300000);
};

export const getMarketChart = (id: string, days: number | 'max'): Promise<any> => {
  const url =
    coingeckoBaseUrl +
    '/coins/' +
    id +
    '/market_chart?vs_currency=usd&days=' +
    days;
  return fetchWithCache(url, 300000);
};

export const getMarketChartMexc = (symbol: string, interval: string): Promise<any> => {
  const url =
    mexcBaseUrl +
    '/api/v3/klines?symbol=' +
    symbol + "USDT" +
    '&interval=' +
    interval;
  return fetchWithCache(url, 300000);
};
