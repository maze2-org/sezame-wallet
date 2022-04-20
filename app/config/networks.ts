export type NetworkType = {
  privateKey: string
  publicKey: string
  capabilities?: Array<"staking" | "lowering" | "lifting">
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
  contract?: string
}
