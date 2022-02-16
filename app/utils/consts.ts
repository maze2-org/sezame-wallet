import { Wallet } from "./wallet"

export const ASSET_TYPE_COIN = "coin"
export const ASSET_TYPE_TOKEN = "token"
export const ASSET_TYPE_NFT = "nft"

export const COIN_LIST: Wallet[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    cid: "bitcoin",
    chain: "BTC",
    type: ASSET_TYPE_COIN,
    decimals: 8,
    contract: null,
    privKey: null,
    walletAddress: null,
    balance: 0,
    unconfirmedBalance: 0,
    value: 0,
    price: 0,
    active: true,
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
    contract: null,
    privKey: null,
    walletAddress: null,
    balance: 0,
    unconfirmedBalance: 0,
    value: 0,
    price: 0,
    active: true,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    version: 1,
  },
]
