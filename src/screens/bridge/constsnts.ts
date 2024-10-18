import { MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL, TESTNET_ALPH_MINIMAL_CONSISTENCY_LEVEL } from "@alephium/wormhole-sdk"

import * as alephiumMainnetConfig from "../../bridges/alephium/artifacts/.deployments.mainnet.json"
import * as alephiumTestnetConfig from "../../bridges/alephium/artifacts/.deployments.testnet.json"

export const WormholeMessageEventIndex = 0
// export const ETH_JSON_RPC_PROVIDER_URL = "https://node-ethereum.sezame.app"
// export const ETH_JSON_RPC_PROVIDER_URL = "https://node-ethereum-testnet.sezame.app"
// export const ETH_JSON_RPC_PROVIDER_URL = "https://sepolia.infura.io/v3/20a5079538764bbb9263cb3fd4dcfce7"

export const BRIDGE_CONSTANTS_MAINNET = {
  ETH_JSON_RPC_PROVIDER_URL: "https://node-ethereum.sezame.app",
  WORMHOLE_RPC_HOSTS: ["https://guardian-0.bridge.alephium.org"],
  ETHEREUM_TOKEN_BRIDGE_ADDRESS: "0x579a3bDE631c3d8068CbFE3dc45B0F14EC18dD43",
  ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId,
  ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL: MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
  ALEPHIUM_BRIDGE_GROUP_INDEX: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.groupIndex,
  ALEPHIUM_BRIDGE_ADDRESS: alephiumMainnetConfig.contracts.Governance.contractInstance.address,
  TRANSFER_TARGET_ADDRESS_HEX: alephiumMainnetConfig.contracts.TokenBridge.contractInstance.address,
}

// Using configs like in wormhole-fork
export const BRIDGE_CONSTANTS_TESTNET = {
  ETH_JSON_RPC_PROVIDER_URL: "https://sepolia.infura.io/v3/20a5079538764bbb9263cb3fd4dcfce7",
  WORMHOLE_RPC_HOSTS: ["https://guardian-0.testnet.bridge.alephium.org"],
  ETHEREUM_TOKEN_BRIDGE_ADDRESS: "0x207Bd15F7150F7E205aD95FBbC2720FA397c388B",
  ALEPHIUM_TOKEN_BRIDGE_CONTRACT_ID: "4c91e8825fcfea5219cf6a5b4f1607db7f0bd22850f39ed87dad9445bd99a800",
  ALEPHIUM_MINIMAL_CONSISTENCY_LEVEL: TESTNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
  ALEPHIUM_BRIDGE_GROUP_INDEX: 0,
  ALEPHIUM_BRIDGE_ADDRESS: "22kH5DXnKjRvnr8y4FSKo9ADCAgQTqQz6oqLP2JJuLapX",
  TRANSFER_TARGET_ADDRESS_HEX: "yqr94FUpZARYoSjB8F7TxLZQUXMKTrt52PVcfY938Hu1",
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
// }


export const getConfigs = (CLUSTER: "mainnet" | "testnet") => {
  switch (CLUSTER) {
    case "mainnet":
      return BRIDGE_CONSTANTS_MAINNET
    case "testnet":
      return BRIDGE_CONSTANTS_TESTNET
  }
}
