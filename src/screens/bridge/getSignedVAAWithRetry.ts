import { ChainId, getSignedVAA } from "@alephium/wormhole-sdk"

export let CURRENT_WORMHOLE_RPC_HOST = -1

export const getNextRpcHost = (hosts: string[]) =>
  ++CURRENT_WORMHOLE_RPC_HOST % hosts.length

export async function getSignedVAAWithRetry(
  hosts: string[],
  emitterChain: ChainId,
  emitterAddress: string,
  targetChain: ChainId,
  sequence: string,
  retryAttempts?: number,
) {
  let result
  let attempts = 0
  while (!result) {
    attempts++
    await new Promise((resolve) => setTimeout(resolve, 1000))
    try {
      result = await getSignedVAA(
        hosts[getNextRpcHost(hosts)],
        emitterChain,
        emitterAddress,
        targetChain,
        sequence,
      )
    } catch (e) {
      console.log("getSignedVAAWithRetry", e)
      if (retryAttempts !== undefined && attempts > retryAttempts) {
        throw e
      }
    }
  }
  return result
}
