import {
  BuildDeployContractTxResult,
  BuildExecuteScriptTxResult,
  BuildTransactionResult
} from '@alephium/web3/dist/src/api/api-alephium'
import { SignClientTypes } from '@walletconnect/types'

import { CallContractTxData, DeployContractTxData, SignMessageData, TransferTxData } from './transactions.ts'

export type SessionRequestEvent = SignClientTypes.EventArguments['session_request']

export type SessionProposalEvent = Pick<SignClientTypes.EventArguments['session_proposal'], 'id' | 'params'>

export type SessionRequestData =
  | {
      type: 'transfer'
      wcData: TransferTxData
      unsignedTxData: BuildTransactionResult
    }
  | {
      type: 'call-contract'
      wcData: CallContractTxData
      unsignedTxData: BuildExecuteScriptTxResult
    }
  | {
      type: 'deploy-contract'
      wcData: DeployContractTxData
      unsignedTxData: BuildDeployContractTxResult
    }
  | {
      type: 'sign-message'
      wcData: SignMessageData
      unsignedTxData?: undefined
    }
