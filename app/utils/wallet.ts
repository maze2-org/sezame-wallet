export interface Wallet {
  symbol: string // the asset's contract symbol
  name: string // the asset's contract name
  cid: string | null // price finder ID
  chain: string // the blockchain ID
  privKey: string | null
  walletAddress: string | null // the address under which the asset is held
  type: string // internal asset type tracker
  contract: string | null // the asset's contract address
  decimals: number | null // the aseet's contract decimals
  image: string | null //  the URL to the logo of the asset
  balance: number // base on confirmed transactions
  unconfirmedBalance: number // based on pending transactions
  value: number // balance * price
  price: number // market price of the asset
  active: true // displayed in the UI
  version: number // configuration version
}
