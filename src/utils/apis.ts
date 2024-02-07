import {CoingeckoCoin} from 'types/coingeckoCoin';
import axios, {CancelTokenSource} from 'axios';

const coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';

const cache = new Map();

// Fonction pour récupérer les données mises en cache ou effectuer une requête et mettre en cache les résultats
const fetchWithCache = (url: string, expiration: number) => {
  // Vérifier si les données sont en cache et si elles ne sont pas expirées
  const cachedData = cache.get(url);
  if (cachedData && Date.now() - cachedData.timestamp < expiration) {
    console.log('USING CACHE', url);
    return Promise.resolve(cachedData.data);
  }
  console.log('NOT USING CACHE', url);

  // Si les données ne sont pas en cache ou sont expirées, effectuer la requête
  return axios
    .get(url)
    .then(response => {
      const data = response.data;
      // Mettre en cache les résultats
      cache.set(url, {data, timestamp: Date.now()});
      return data;
    })
    .catch(error => {
      throw error;
    });
};

export const getCoinDetails = (symbol: string): Promise<CoingeckoCoin> => {
  const url = coingeckoBaseUrl + '/coins/' + symbol + '?sparkline=true';
  return fetchWithCache(url, 600000);
};

export const getCoinPrices = (
  ids: string,
  signal?: CancelTokenSource,
): Promise<{[key: string]: {usd?: number}}> => {
  if (!ids) {
    return Promise.resolve({});
  }

  const url = coingeckoBaseUrl + `/simple/price?vs_currencies=usd&ids=${ids}`;
  return fetchWithCache(url, 300000);
};

export const getMarketChart = (id: string, days: number): Promise<any> => {
  const url =
    coingeckoBaseUrl +
    '/coins/' +
    id +
    '/market_chart?vs_currency=usd&days=' +
    days;
  return fetchWithCache(url, 300000);
};
