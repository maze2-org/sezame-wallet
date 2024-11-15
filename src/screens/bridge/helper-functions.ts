import { ethers } from "ethers"
import { CHAIN_ID_ETH, ChainId, isEVMChain } from "@alephium/wormhole-sdk"
import { DefaultEVMChainConfirmations, EpochDuration } from "screens/bridge/constsnts.ts"

export function sleep(ms: number) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

export function checkEVMChainId(chainId: ChainId) {
  if (!isEVMChain(chainId)) {
    throw new Error(`invalid chain id ${chainId}, expected an evm chain`)
  }
}

export async function getEVMCurrentBlockNumber(provider: ethers.providers.Provider, chainId: ChainId): Promise<number> {
  checkEVMChainId(chainId)
  const data = await provider.getBlock("finalized")
  return data.number
}

export function isEVMTxConfirmed(chainId: ChainId, txBlock: number, currentBlock: number): boolean {
  checkEVMChainId(chainId)
  return chainId === CHAIN_ID_ETH
    ? currentBlock >= txBlock
    : currentBlock >= (txBlock + DefaultEVMChainConfirmations)
}

export async function waitEVMTxConfirmed(provider: ethers.providers.Provider, txBlockNumber: number, chainId: ChainId) {
  checkEVMChainId(chainId)
  await _waitEVMTxConfirmed(provider, txBlockNumber, chainId)
}

async function _waitEVMTxConfirmed(
  provider: ethers.providers.Provider,
  txBlockNumber: number,
  chainId: ChainId,
  lastBlockNumber: number | undefined = undefined,
  lastBlockUpdatedTs: number = Date.now(),
) {
  const currentBlockNumber = await getEVMCurrentBlockNumber(provider, chainId)
  if (isEVMTxConfirmed(chainId, txBlockNumber, currentBlockNumber)) {
    return
  }
  await sleep(3000)
  const now = Date.now()
  const [evmProvider, timestamp] = currentBlockNumber === lastBlockNumber && (now - lastBlockUpdatedTs > EpochDuration)
    ? [provider, now]
    : currentBlockNumber !== lastBlockNumber
      ? [provider, now]
      : [provider, lastBlockUpdatedTs]
  await _waitEVMTxConfirmed(evmProvider, txBlockNumber, chainId, currentBlockNumber, timestamp)
}
