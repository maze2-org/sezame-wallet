import { cast, flow, getRoot, Instance, SnapshotOut, types } from "mobx-state-tree"
import SignClient from '@walletconnect/sign-client';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import {
  parseSessionProposalEvent,
  walletConnectRequestToTitle,
  extractBlockchainDetailsFromRequest,
  extractBlockchainDetailsFromProposal,
  getWalletConnectProposalAlephiumGroup,
} from 'utils/wallet-connect';
import { SessionTypes } from '@walletconnect/types';
import { parseChain, formatChain } from '@alephium/walletconnect-provider';
import { SignClientTypes } from '@walletconnect/types';
import { BaseWalletDescription } from 'models';
import {
  getTransactionAssetAmounts,
  signAndSendTransaction,
} from 'api/transactions.ts';
import { showMessage } from 'react-native-flash-message';

const WalletConnectAction = types.model({
  id: types.number,
  action: types.string,
  title: types.string,
  description: types.string,
  logo: types.maybe(types.string),
  eventData:
    types.frozen<
      SignClientTypes.EventArguments['session_proposal' | 'session_request']
    >(),
  blockchain: types.enumeration(['alephium', 'eip155']),
  alephiumGroup: types.maybe(types.string),
  status: types.enumeration([
    'pending',
    'started',
    'canceled',
    'finished',
    'require_alph_group_switch',
  ]),
});

const walletConnectActionTypes = [
  'sessionProposal',
  'alph_signAndSubmitExecuteScriptTx',
  'signAndSubmitExecuteScriptTx',
] as const;

export type WalletConnectActionType = (typeof walletConnectActionTypes)[number];

export type IWalletConnectAction = Instance<typeof WalletConnectAction>;
/**
 * Model description here for TypeScript hints.
 */
export const WalletConnectModel = types
  .model('WalletConnect')
  .props({
    connected: types.optional(types.boolean, false),
    sessionRequestData: types.optional(types.frozen(), null),
    client: types.maybe(types.frozen()),
    nextActions: types.optional(types.array(WalletConnectAction), []),
    openTxModal: types.optional(types.boolean, false),
  })
  .views(self => ({}))
  .actions(self => ({
    init: flow(function* connect() {
      const store = cast<WalletConnectType>(self);

      if (self.client) {
        return;
      }

      const walletConnectClient: SignClient = yield SignClient.init({
        projectId: '2a084aa1d7e09af2b9044a524f39afbe',
        metadata: {
          name: 'Alephium mobile wallet',
          description: 'Alephium mobile wallet',
          url: 'https://github.com/alephium/alephium-frontend',
          icons: ['https://alephium.org/favicon-32x32.png'],
          redirect: {
            native: 'alephium://',
          },
        },
      });
      self.client = walletConnectClient;

      walletConnectClient.on('session_proposal', store.onSessionProposal);
      walletConnectClient.on('session_request', store.onSessionRequest);
      walletConnectClient.on('session_delete', store.onSessionDelete);
      walletConnectClient.on('session_update', store.onSessionUpdate);
      walletConnectClient.on('session_event', store.onSessionEvent);
      walletConnectClient.on('session_ping', store.onSessionPing);
      walletConnectClient.on('session_expire', store.onSessionExpire);
      walletConnectClient.on('session_extend', store.onSessionExtend);
      walletConnectClient.on('proposal_expire', store.onProposalExpire);
    }),
    connect: flow(function* connect(uri: string, topic?: string) {
      const walletConnectClient = self.client;

      try {
        for (const pairing of walletConnectClient.core.pairing.getPairings()) {
          yield walletConnectClient.disconnect({
            topic: pairing.topic,
            reason: getSdkError('USER_DISCONNECTED'),
          });
        }
      } catch (e) {
        console.log('❌ connect ERROR', e);
      }

      const pairingTopic = topic
        ? topic
        : uri.substring('wc:'.length, uri.indexOf('@'));
      try {
        const pairings = walletConnectClient.core.pairing.pairings;
        let existingPairing = pairings.values.find(
          ({ topic }: { topic: string }) => topic === pairingTopic,
        );

        if (existingPairing) {
          console.log(
            '⏳ TRYING TO CONNECT WITH EXISTING PAIRING:',
            pairingTopic,
          );
          if (!existingPairing.active) {
            console.log('⏳ EXISTING PAIRING IS INACTIVE, ACTIVATING IT...');
            // `activate` doesn't trigger the onSessionProposal as the `pair` does (even if we call `pair` or `connect`)
            // despite what the docs say (https://specs.walletconnect.com/2.0/specs/clients/sign/session-events#session_proposal)
            // so we manually check for pending requests in the history that match with the pairingTopic and trigger
            // onSessionProposal.
            try {
              yield walletConnectClient.core.pairing.activate({
                topic: existingPairing.topic,
              });
              console.log('✅ ACTIVATING PAIRING: DONE!');
            } catch (e) {
              console.log('❌ ERROR ACTIVATING PAIRING!');
            }
          }

          console.log('⏳ LOOKING FOR PENDING PROPOSAL REQUEST...');

          console.log('✅ CONNECTING: DONE!');

          const pendingProposal = walletConnectClient.core.history.pending.find(
            ({ topic, request }) =>
              topic === existingPairing.topic &&
              request.method === 'wc_sessionPropose',
          );
          if (pendingProposal) {
            console.log('👉 FOUND PENDING PROPOSAL REQUEST!');
            onSessionProposal({
              ...pendingProposal.request,
              params: {
                id: pendingProposal.request.id,
                ...pendingProposal.request.params,
              },
            });
          } else {
            console.error(
              '❌ This WalletConnect session is not valid anymore. Try to refresh the dApp and connect again. Session topic: ' +
              existingPairing.topic,
            );
          }
        } else {
          try {
            yield walletConnectClient.core.pairing.pair({ uri });
          } catch (e) {
            console.error('❌ COULD NOT PAIR WITH: ', uri, e);
          }
          console.log('✅ PAIRING: DONE!');
        }
      } catch (e) {
        console.error('❌ COULD NOT PAIR WITH: ', uri, e);
      }

      self.client = walletConnectClient;
    }),
    onSessionProposal: flow(function* onSessionProposal(
      data: SignClientTypes.EventArguments['session_proposal'],
    ) {
      console.log('onSessionProposal', data);
      const blockchain = extractBlockchainDetailsFromProposal(data);
      if (!['eip155', 'alephium'].includes(blockchain)) {
        console.log('Incompatible blockchain', blockchain);
        return;
      }

      self.nextActions.push({
        id: data.id,
        action: "sessionProposal",
        blockchain,
        title: data.params.proposer.metadata.name,
        description: data.params.proposer.metadata.description,
        logo: data.params.proposer.metadata.icons[0],
        eventData: data,
        alephiumGroup: getWalletConnectProposalAlephiumGroup(data),
        status: "pending",
      })
    }),
    onSessionRequest: flow(function* onSessionRequest(
      data: SignClientTypes.EventArguments['session_request'],
    ) {
      const blockchain = extractBlockchainDetailsFromRequest(data);
      if (!blockchain) {
        console.log('Unable to detect blockchain type');
        return;
      }

      if (!['eip155', 'alephium'].includes(blockchain)) {
        console.log('Incompatible blockchain', blockchain);
        return;
      }

      // TODO commented for handling explorerApi request
      // if (
      //   !(walletConnectActionTypes as unknown as string[]).includes(
      //     data.params.request.method,
      //   )
      // ) {
      //   console.log(
      //     'This method is not allowed yet',
      //     data.params.request.method,
      //   );
      //   return;
      // }

      const existingActionIndex = self.nextActions.findIndex(
        action =>
          action.action === data.params.request.method &&
          action.blockchain === blockchain,
      );

      const newAction = {
        id: data.id,
        action: data.params.request.method,
        blockchain,
        description: '',
        eventData: data,
        status: 'pending',
        title: walletConnectRequestToTitle(data.params.request.method),
      };

      if (existingActionIndex !== -1) {
        console.log(
          'Action already exists for this method and blockchain:',
          data.params.request.method,
        );
      } else {
        // Action does not exist, add it
        console.log(
          '--------------------------- ADD SESSION_REQUEST ---------------------------',
          newAction,
        );
        self.nextActions.push(newAction);
      }
    }),
    onSessionDelete: flow(function* onSessionDelete(data) {
      console.log('onSessionDelete', data);
      // self.client.disconnect({
      //   topic: data.topic,
      //   reason: getSdkError("USER_DISCONNECTED"),
      // }).then((res: any) => {
      //   console.log("end", res)
      // })
    }),
    onSessionUpdate: flow(function* onSessionUpdate(data) {
      console.log('onSessionUpdate', data);
    }),
    onSessionEvent: flow(function* onSessionEvent(data) {
      console.log('onSessionEvent', data);
    }),
    onSessionPing: flow(function* onSessionPing(data) {
      console.log('onSessionPing', data);
    }),
    onSessionExpire: flow(function* onSessionExpire(data) {
      console.log('onSessionExpire', data);
    }),
    onSessionExtend: flow(function* onSessionExtend(data) {
      console.log('onSessionExtend', data);
    }),
    onProposalExpire: flow(function* onProposalExpire(data) {
      console.log('onProposalExpire', data);
    }),

    removeAction: flow(function* (action: IWalletConnectAction) {
      self.nextActions.remove(action);
    }),

    requestExplorerApi: flow(function* (action: IWalletConnectAction) { }),

    toggleTxModal: flow(function* (action: boolean) {
      self.openTxModal = action;
    }),

    acceptEthTx: flow(function* (action: IWalletConnectAction) {
      const requestEvent = action.eventData;
      const client: SignClient = self.client;
      /*try {
        yield client.respond({
          topic: requestEvent.topic,
          response: {
            id: requestEvent.id,
            jsonrpc: '2.0',
            result: signResult
          },
        });
      } catch (err) {
        console.log('Error while refusing the transaction...');
      } finally {
        self.openTxModal = false;
        self.nextActions.remove(action);
      }*/
      console.log(action, 'action');
    }),

    acceptAlphTx: flow(function* (
      action: IWalletConnectAction,
      sessionRequestData,
      currentWalletStore,
    ) {
      const requestEvent = action.eventData;
      const client: SignClient = self.client;
      try {
        const data = yield signAndSendTransaction(
          sessionRequestData.wcData.fromAddress,
          sessionRequestData.unsignedTxData.txId,
          sessionRequestData.unsignedTxData.unsignedTx,
          currentWalletStore,
        );
        const { attoAlphAmount, tokens } = sessionRequestData.wcData.assetAmounts
          ? getTransactionAssetAmounts(sessionRequestData.wcData.assetAmounts)
          : { attoAlphAmount: undefined, tokens: undefined };
        const signResult = {
          groupIndex: sessionRequestData.unsignedTxData.fromGroup,
          unsignedTx: sessionRequestData.unsignedTxData.unsignedTx,
          txId: sessionRequestData.unsignedTxData.txId,
          signature: data.signature,
          gasAmount: sessionRequestData.unsignedTxData.gasAmount,
          gasPrice: BigInt(sessionRequestData.unsignedTxData.gasPrice),
        };
        try {
          yield client.respond({
            topic: requestEvent.topic,
            response: {
              id: requestEvent.id,
              jsonrpc: '2.0',
              result: signResult,
            },
          });
          showMessage({
            message: 'Success!',
            type: 'success',
          });
        } catch (err) {
          showMessage({
            message: err?.message || 'Error',
            type: 'danger',
          });
          console.log(err, 'Error while refusing the transaction...');
        } finally {
          self.openTxModal = false;
          self.nextActions.remove(action);
        }
      } catch (e) {
        console.log(e, 'ee');
      } finally {
        self.nextActions.remove(action);
        self.openTxModal = false;
      }
    }),

    refuseAlphTx: flow(function* (action: IWalletConnectAction) {
      const client: SignClient = self.client;
      const rawEvent =
        action.eventData as SignClientTypes.EventArguments['session_request'];

      try {
        yield client.respond({
          topic: rawEvent.topic,
          response: {
            id: rawEvent.id,
            jsonrpc: '2.0',
            error: getSdkError('USER_REJECTED'),
          },
        });
        showMessage({
          message: 'Success!',
          type: 'success',
        });
      } catch (err) {
        showMessage({
          message: err?.message || 'Error!',
          type: 'danger',
        });
        console.log('Error while refusing the transaction...');
      } finally {
        self.nextActions.remove(action);
        self.openTxModal = false;
      }
    }),
    requireExplorerApi: flow(function* (
      action: IWalletConnectAction,
      result: any,
    ) {
      const client: SignClient = self.client;
      const rawEvent =
        action.eventData as SignClientTypes.EventArguments['session_request'];

      try {
        yield client.respond({
          topic: rawEvent.topic,
          response: {
            id: rawEvent.id,
            jsonrpc: '2.0',
            result: result,
          },
        });
      } catch (err) {
        console.error('❌ requireExplorerApi' + 'err');
      } finally {
        self.nextActions.remove(action);
        self.openTxModal = false;
      }
    }),
    requireNodeApi: flow(function* (action: IWalletConnectAction, result: any) {
      const client: SignClient = self.client;
      const rawEvent =
        action.eventData as SignClientTypes.EventArguments['session_request'];

      try {
        yield client.respond({
          topic: rawEvent.topic,
          response: {
            id: rawEvent.id,
            jsonrpc: '2.0',
            result: result,
          },
        });
      } catch (err) {
        console.error('❌ requireExplorerApi' + 'err');
      } finally {
        self.nextActions.remove(action);
        self.openTxModal = false;
      }
    }),
    approveConnection: flow(function* (
      action: IWalletConnectAction,
      walletToBeUsed: BaseWalletDescription | null,
      activeSessions: SessionTypes.Struct[],
      ethWalletToBeUsed: BaseWalletDescription | null,
    ) {
      const proposalEvent = action.eventData;
      console.log('Approving session...', proposalEvent);

      let blockchainType = 'ethereum'; // 'alephium' or 'ethereum';
      const { id, requiredNamespaces, relays } = proposalEvent.params || {};
      const nameSpaceName = Object.keys(requiredNamespaces)[0];
      const requiredNamespace = requiredNamespaces[nameSpaceName];
      const requiredChains = requiredNamespace.chains;

      if (requiredChains[0].includes('alephium')) {
        blockchainType = 'alephium';
      }
      console.log('approving session ------------------------------------', {
        blockchainType,
        group: walletToBeUsed.group,
        address: walletToBeUsed.address,
      });

      if (blockchainType === 'alephium') {
        const requiredChainInfo = requiredChains
          ? parseChain(requiredChains[0])
          : undefined;

        if (
          walletToBeUsed.group !== requiredChainInfo?.addressGroup?.toString()
        ) {
          action.status = 'require_alph_group_switch';
          return null;
        }

        try {
          if (!requiredChainInfo) {
            return false;
          }

          const namespaces: SessionTypes.Namespaces = {
            [nameSpaceName]: {
              methods: requiredNamespace.methods,
              events: requiredNamespace.events,
              accounts: [
                `${formatChain(requiredChainInfo.networkId, requiredChainInfo.addressGroup)}:${walletToBeUsed.publicKey}/default`,
              ],
            },
          };

          const { metadata } = parseSessionProposalEvent(proposalEvent);

          const existingSession = activeSessions.find(
            session => session.peer.metadata.url === metadata.url,
          );
          if (existingSession) {
            try {
              yield self.client.disconnect({
                topic: existingSession.topic,
                reason: getSdkError('USER_DISCONNECTED'),
              });
            } catch (e) {
              showMessage({
                message: e?.message || 'Error!',
                type: 'danger',
              });
              console.log(e, '❌ error');
            }
          }

          const { topic, acknowledged } = yield self.client.approve({
            id,
            relayProtocol: relays[0].protocol,
            namespaces,
          });
          showMessage({
            message: 'Success!',
            type: 'success',
          });
        } catch (error) {
          showMessage({
            message: error?.message || 'Error!',
            type: 'danger',
          });
          console.error('❌ approveConnection', error);
          return false;
        } finally {
          const root = getRoot(self);
          root.setWalletConnectSscannerShown(false);
          self.nextActions.remove(action);
        }
        return true;
      } else {
        try {
          const approvedNamespaces = buildApprovedNamespaces({
            proposal: proposalEvent.params,
            supportedNamespaces: {
              eip155: {
                ...requiredNamespaces.eip155,
                accounts: [
                  `eip155:1:${ethWalletToBeUsed.address}`,
                  `eip155:137:${ethWalletToBeUsed.address}`,
                ],
              },
            },
          });

          yield self.client.approve({
            id,
            namespaces: approvedNamespaces,
          });
          showMessage({
            message: 'Success!',
            type: 'success',
          });
        } catch (e) {
          self.nextActions.remove(action);
          const root = getRoot(self);
          root.setWalletConnectSscannerShown(false);
          showMessage({
            message: e?.message,
            type: 'danger',
          });
          console.error('❌ approveConnection', e);
        } finally {
          self.nextActions.remove(action);
        }
      }
    }),
    rejectConnection: flow(function* (action: IWalletConnectAction) {
      self.nextActions.remove(action);
      const root = getRoot(self);
      root.setWalletConnectSscannerShown(false);
    }),
  }));

type WalletConnectType = Instance<typeof WalletConnectModel>;
export interface WalletConnect extends WalletConnectType { }
type WalletConnectSnapshotType = SnapshotOut<typeof WalletConnectModel>;
export interface WalletConnectSnapshot extends WalletConnectSnapshotType { }
export const createWalletConnectDefaultModel = () =>
  types.optional(WalletConnectModel, {
    connected: false,
  });
