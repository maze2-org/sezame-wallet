import { MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL, TESTNET_ALPH_MINIMAL_CONSISTENCY_LEVEL } from "@alephium/wormhole-sdk"

import * as alephiumMainnetConfig from "../../bridges/alephium/artifacts/.deployments.mainnet.json"
import * as alephiumTestnetConfig from "../../bridges/alephium/artifacts/.deployments.testnet.json"

export const ALPH_DECIMAL = 1000000000000000000
export const WormholeMessageEventIndex = 0
export const DefaultEVMChainConfirmations = 15
export const EpochDuration = 480000
// export const ETH_JSON_RPC_PROVIDER_URL = "https://node-ethereum.sezame.app"
// export const ETH_JSON_RPC_PROVIDER_URL = "https://node-ethereum-testnet.sezame.app"
// export const ETH_JSON_RPC_PROVIDER_URL = "https://sepolia.infura.io/v3/20a5079538764bbb9263cb3fd4dcfce7"

export const BRIDGE_CONSTANTS_MAINNET = {
  ETH_JSON_RPC_PROVIDER_URL: "https://node-ethereum.sezame.app",
  WORMHOLE_RPC_HOSTS: ["https://guardian-0.bridge.alephium.org"],
  ETHEREUM_TOKEN_BRIDGE_ADDRESS: "0x579a3bDE631c3d8068CbFE3dc45B0F14EC18dD43",
  ALEPHIUM_ADDRESS_IN_ETH_NETWORK: "0x590f820444fa3638e022776752c5eef34e2f89a6",
  ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId,
  ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL: MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
  ALEPHIUM_BRIDGE_GROUP_INDEX: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.groupIndex,
  ALEPHIUM_BRIDGE_ADDRESS: alephiumMainnetConfig.contracts.Governance.contractInstance.address,
  TRANSFER_TARGET_ADDRESS_HEX: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.address,
  ETH_BRIDGE_ADDRESS: "0x01e82b67367dE9f805E55de730D5007a752912A8",
}

// Using configs like in wormhole-fork
export const BRIDGE_CONSTANTS_TESTNET = {
  ETH_JSON_RPC_PROVIDER_URL: "https://sepolia.infura.io/v3/20a5079538764bbb9263cb3fd4dcfce7",
  WORMHOLE_RPC_HOSTS: ["https://guardian-0.testnet.bridge.alephium.org"],
  ETHEREUM_TOKEN_BRIDGE_ADDRESS: "0x207Bd15F7150F7E205aD95FBbC2720FA397c388B",
  ALEPHIUM_ADDRESS_IN_ETH_NETWORK: "0xD62Efc730439F0ad1D6B29448ff9aE894B7857c1",
  ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID: "4c91e8825fcfea5219cf6a5b4f1607db7f0bd22850f39ed87dad9445bd99a800",
  ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL: TESTNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
  ALEPHIUM_BRIDGE_GROUP_INDEX: 0,
  ALEPHIUM_BRIDGE_ADDRESS: "22kH5DXnKjRvnr8y4FSKo9ADCAgQTqQz6oqLP2JJuLapX",
  TRANSFER_TARGET_ADDRESS_HEX: "yqr94FUpZARYoSjB8F7TxLZQUXMKTrt52PVcfY938Hu1",
  ETH_BRIDGE_ADDRESS: "0x91025D8a7E70cF478eC9F759C492cD23D298045C",
}

// Using our config file
// export const BRIDGE_CONSTANTS_TESTNET = {
//   ETH_JSON_RPC_PROVIDER_URL: "https://sepolia.infura.io/v3/20a5079538764bbb9263cb3fd4dcfce7",
//   WORMHOLE_RPC_HOSTS: ["https://guardian-0.testnet.bridge.alephium.org"],
//   ETHEREUM_TOKEN_BRIDGE_ADDRESS: "0x207Bd15F7150F7E205aD95FBbC2720FA397c388B",
//   ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID: alephiumTestnetConfig.contracts.TokenBridge.contractInstance.contractId,
//   ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL: TESTNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
//   ALEPHIUM_BRIDGE_GROUP_INDEX: alephiumTestnetConfig.contracts.TokenBridge.contractInstance.groupIndex,
//   ALEPHIUM_BRIDGE_ADDRESS: alephiumTestnetConfig.contracts.Governance.contractInstance.address,
//   TRANSFER_TARGET_ADDRESS_HEX: alephiumTestnetConfig.contracts.TokenBridge.contractInstance.address,
//   ETH_BRIDGE_ADDRESS: '0x91025D8a7E70cF478eC9F759C492cD23D298045C'
// }


export const getConfigs = (CLUSTER: "mainnet" | "testnet") => {
  switch (CLUSTER) {
    case "mainnet":
      return BRIDGE_CONSTANTS_MAINNET
    case "testnet":
      return BRIDGE_CONSTANTS_TESTNET
  }
}

export type ICheckboxPercentItem = { value: number, title: string, percent: number }

export const CHECKBOXES_PERCENT: ICheckboxPercentItem[] = [
  { value: 1, title: "25%", percent: 25 },
  { value: 2, title: "50%", percent: 50 },
  { value: 3, title: "75%", percent: 75 },
]
