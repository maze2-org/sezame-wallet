import { IWalletAsset } from "models/current-wallet/current-wallet"

export const ASSET_TYPE_COIN = "coin"
export const ASSET_TYPE_TOKEN = "token"
export const ASSET_TYPE_NFT = "nft"

export const defaultAssets: IWalletAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    cid: "bitcoin",
    chain: "BTC",
    type: ASSET_TYPE_COIN,
    decimals: 8,
    privateKey: "",
    publicKey: "",
    address: "",
    balance: 0,
    value: 0,
    rate: 0,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    version: 1,
    contract: "",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    cid: "ethereum",
    chain: "ETH",
    type: ASSET_TYPE_COIN,
    decimals: 18,
    privateKey: "",
    publicKey: "",
    address: "",
    balance: 0,
    value: 0,
    rate: 0,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    version: 1,
    contract: "",
  },
  {
    symbol: "AVT",
    name: "Aventus",
    cid: "aventus",
    chain: "AVN",
    type: ASSET_TYPE_COIN,
    decimals: 18,
    privateKey: "",
    publicKey: "",
    address: "",
    balance: 0,
    value: 0,
    rate: 0,
    image: "https://assets.coingecko.com/coins/images/901/small/Aventus.png?1625122968",
    version: 1,
    contract: "",
  },
]
export const chainSymbolsToNames = {
  BTC: "Bitcoin network",
  ETH: "Ethereum network",
  POLYGON: "Polygon network",
  BSC: "Binance Smart Chain",
  AVN: "Aventus network",
  ALPH: "Alephium network",
}
