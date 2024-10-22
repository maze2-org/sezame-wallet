import { ChainId } from "@alephium/wormhole-sdk"
import { node } from "@alephium/web3"

export class AlphTxInfo {
  blockHash: string
  blockHeight: number
  blockTimestamp: number
  txId: string
  sequence: string
  targetChain: ChainId
  confirmations: number

  constructor(blockHeader: node.BlockHeaderEntry, txId: string, sequence: string, targetChain: ChainId, confirmations: number) {
    this.blockHash = blockHeader.hash
    this.blockHeight = blockHeader.height
    this.blockTimestamp = blockHeader.timestamp
    this.txId = txId
    this.sequence = sequence
    this.targetChain = targetChain
    this.confirmations = confirmations
  }
}
