import {parseChain, PROVIDER_NAMESPACE} from '@alephium/walletconnect-provider';
import {SignClientTypes} from '@walletconnect/types';
import {WalletConnectActionType} from 'models/wallet-connect/wallet-connect.model';

export const parseSessionProposalEvent = (proposalEvent: any) => {
  const {id, requiredNamespaces, relays} = proposalEvent.params;
  const {metadata} = proposalEvent.params.proposer;
  const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE];
  const requiredChains = requiredNamespace.chains;
  const requiredChainInfo = requiredChains
    ? parseChain(requiredChains[0])
    : undefined;

  return {
    id,
    relayProtocol: relays[0].protocol,
    requiredNamespace,
    requiredChains,
    requiredChainInfo,
    metadata,
  };
};

export const getWalletConnectProposalAlephiumGroup = (
  data: SignClientTypes.EventArguments['session_proposal'],
): string | undefined => {
  if (
    data.params.requiredNamespaces['alephium'] &&
    data?.params?.requiredNamespaces?.['alephium']?.chains?.[0]
  ) {
    const regex = /alephium:(.*?)\/(\d+)$/;
    const match =
      data.params.requiredNamespaces['alephium'].chains[0].match(regex);

    return match ? match[2] : undefined;
  }
  return undefined;
};

export const extractBlockchainDetailsFromProposal = (
  data: SignClientTypes.EventArguments['session_proposal'],
): string => {
  const blockchain = Object.keys(data.params.requiredNamespaces)[0];
  return blockchain;
};

export const extractBlockchainDetailsFromRequest = (
  data: SignClientTypes.EventArguments['session_request'],
): 'ethereum' | 'alephium' | null => {
  try {
    const blockchain = data.params.chainId.split(':')?.[0]?.toLowerCase() as
      | 'ethereum'
      | 'alephium';
    if (!['ethereum', 'alephium'].includes(blockchain)) return null;

    return blockchain;
  } catch (error) {
    return null;
  }
};

export const walletConnectRequestToTitle = (
  transactionType: WalletConnectActionType | string,
): string => {
  switch (transactionType) {
    case 'alph_signAndSubmitExecuteScriptTx':
      return 'An alephium transaction to sign';
    case 'sessionProposal':
      return 'Wallet connect authentication';
    case 'signAndSubmitExecuteScriptTx':
      return 'Ney transaction to sign';
    default:
      return '';
  }
};
