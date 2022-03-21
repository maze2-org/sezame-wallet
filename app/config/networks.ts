export type NetworkType = {
  privateKey: string
  publicKey: string
  balance: number
  value: number
  rate: number
  version: number
  symbol: string
  name: string
  cid: string
  chain: string
  type: string
  decimals: number
  address: string
  image: string
}

const COMMON = {
  privateKey: "",
  publicKey: "",
  balance: 0,
  value: 0,
  rate: 0,
  version: 1,
}

export const NETWORKS: Array<NetworkType> = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    cid: "bitcoin",
    chain: "BTC",
    type: "coin",
    decimals: 8,
    address: "bc1qx6juea389gv4g3qzz0vwmzjjjhxwtdvzmk2e6c",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    ...COMMON,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    cid: "ethereum",
    chain: "ETH",
    type: "coin",
    decimals: 18,
    address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    ...COMMON,
  },
  {
    symbol: "AVT",
    name: "Aventus",
    cid: "aventus",
    chain: "AVN",
    type: "coin",
    decimals: 18,
    address: "",
    image: "https://assets.coingecko.com/coins/images/901/small/Aventus.png?1625122968",
    ...COMMON,
  },
  {
    symbol: "ALPH",
    name: "Alephium",
    cid: "alephium",
    chain: "ALPH",
    type: "coin",
    decimals: 18,
    address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
    image:
      "https://assets.coingecko.com/coins/images/21598/large/Alephium-Logo_200x200_listing.png",
    ...COMMON,
  },
]
