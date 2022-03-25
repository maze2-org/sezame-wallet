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
  },
]
export const chainSymbolsToNames = {
  BTC: "Bitcoin",
  ETH: "Ethereum network",
  POLYGON: "POLYGON network",
  BSC: "Binance Smart Chain",
  AVN: "Aventus network",
  ALPH: "ALPH",
}
export const CHAIN_ID_MAP = {
  ETH: 1,
  BSC: 56,
  POLYGON: 137,
}
export const CHAIN_ID_TYPE_MAP = {
  1: "ETH",
  56: "BSC",
  137: "POLYGON",
}
