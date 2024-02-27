import {flow, Instance, SnapshotOut, types} from 'mobx-state-tree';
import SignClient, {
  REQUEST_CONTEXT,
  SESSION_CONTEXT,
  SIGN_CLIENT_STORAGE_PREFIX,
} from '@walletconnect/sign-client';
import {getSdkError} from '@walletconnect/utils';
import {
  extractBlockchainDetailsFromProposal,
  extractBlockchainDetailsFromRequest,
  getWalletConnectProposalAlephiumGroup,
  walletConnectRequestToTitle,
} from 'utils/wallet-connect';
import {SessionTypes} from '@walletconnect/types';
import {parseChain, formatChain} from '@alephium/walletconnect-provider';
import {SignClientTypes} from '@walletconnect/types';
import {BaseWalletDescription} from 'models';

const WalletConnectAction = types.model({
  action: types.string,
  title: types.string,
  description: types.string,
  logo: types.maybe(types.string),
  eventData:
    types.frozen<
      SignClientTypes.EventArguments['session_proposal' | 'session_request']
    >(),
  blockchain: types.enumeration(['alephium', 'ethereum']),
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
    client: types.maybe(types.frozen()),
    nextActions: types.optional(types.array(WalletConnectAction), []),
  })
  .views(self => ({}))
  .actions(self => ({
    init: flow(function* connect() {
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

      console.log('INITIALIZED A NEW WALLET CONNECTION.................');
    }),
    connect: flow(function* connect(uri: string) {
      const walletConnectClient = self.client;

      console.log(self);
      walletConnectClient.on('session_proposal', self.onSessionProposal);
      walletConnectClient.on('session_request', self.onSessionRequest);
      walletConnectClient.on('session_delete', self.onSessionDelete);
      walletConnectClient.on('session_update', self.onSessionUpdate);
      walletConnectClient.on('session_event', self.onSessionEvent);
      walletConnectClient.on('session_ping', self.onSessionPing);
      walletConnectClient.on('session_expire', self.onSessionExpire);
      walletConnectClient.on('session_extend', self.onSessionExtend);
      walletConnectClient.on('proposal_expire', self.onProposalExpire);

      const pairingTopic = uri.substring('wc:'.length, uri.indexOf('@'));
      try {
        const pairings = walletConnectClient.core.pairing.pairings;
        let existingPairing = pairings.values.find(
          ({topic}: {topic: string}) => topic === pairingTopic,
        );

        // console.log({existingPairing});

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
            yield walletConnectClient.core.pairing.activate({
              topic: existingPairing.topic,
            });
            console.log('✅ ACTIVATING PAIRING: DONE!');
          }
          console.log('✅ CONNECTING: DONE!');

          console.log('⏳ LOOKING FOR PENDING PROPOSAL REQUEST...');
        } else {
          console.log('⏳ PAIRING WITH WALLETCONNECT USING URI:', uri);
          yield walletConnectClient.core.pairing.pair({uri});
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
      if (!['ethereum', 'alephium'].includes(blockchain)) {
        console.log('Incompatible blockchain', blockchain);
        return;
      }

      self.nextActions.push({
        action: 'sessionProposal',
        blockchain,
        title: data.params.proposer.metadata.name,
        description: data.params.proposer.metadata.description,
        logo: data.params.proposer.metadata.icons[0],
        eventData: data,
        alephiumGroup: getWalletConnectProposalAlephiumGroup(data),
        status: 'pending',
      });
    }),
    onSessionRequest: flow(function* onSessionRequest(
      data: SignClientTypes.EventArguments['session_request'],
    ) {
      console.log('onSessionRequest', JSON.stringify(data, null, 2));
      const blockchain = extractBlockchainDetailsFromRequest(data);
      if (!blockchain) {
        console.log('Unable to detect blockchain type');
        return;
      }

      if (!['ethereum', 'alephium'].includes(blockchain)) {
        console.log('Incompatible blockchain', blockchain);
        return;
      }

      if (
        !(walletConnectActionTypes as unknown as string[]).includes(
          data.params.request.method,
        )
      ) {
        console.log(
          'This method is not allowed yet',
          data.params.request.method,
        );
        return;
      }

      self.nextActions.push({
        action: data.params.request.method,
        blockchain,
        description: '',
        eventData: data,
        status: 'pending',
        title: walletConnectRequestToTitle(data.params.request.method),
      });
    }),
    onSessionDelete: flow(function* onSessionDelete(data) {
      console.log('onSessionDelete', data);
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

    acceptAlphTx: flow(function* (action: IWalletConnectAction) {
      console.log('accept alph tx', JSON.stringify(action, null, 2));
    }),

    refuseAlphTx: flow(function* (action: IWalletConnectAction) {
      console.log('refuse alph tx', JSON.stringify(action, null, 2));
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
      } catch (err) {
        console.log('Error while refusing the transaction...');
      } finally {
        self.nextActions.remove(action);
      }
    }),

    approveConnection: flow(function* (
      action: IWalletConnectAction,
      walletToBeUsed: BaseWalletDescription,
    ) {
      const proposalEvent = action.eventData;
      console.log('Approving session...', proposalEvent);

      const {id, requiredNamespaces, relays} = proposalEvent.params;
      const nameSpaceName = Object.keys(requiredNamespaces)[0];
      const requiredNamespace = requiredNamespaces[nameSpaceName];
      const requiredChains = requiredNamespace.chains;
      const requiredChainInfo = requiredChains
        ? parseChain(requiredChains[0])
        : undefined;

      console.log('passse1');
      if (
        walletToBeUsed.group !== requiredChainInfo?.addressGroup?.toString()
      ) {
        action.status = 'require_alph_group_switch';
        console.log('passse2');
        return null;
      }

      console.log('passse3');
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

        console.log(JSON.stringify(namespaces, null, 2));

        const {topic, acknowledged} = yield self.client.approve({
          id,
          relayProtocol: relays[0].protocol,
          namespaces,
        });

        console.log({topic, acknowledged});
      } catch (error) {
        return false;
      } finally {
        console.log('FINALLLLLLLLLLLLLLLLLLLLLLLLLY');
        self.nextActions.remove(action);
      }
      return true;
    }),
  }));

type WalletConnectType = Instance<typeof WalletConnectModel>;
export interface WalletConnect extends WalletConnectType {}
type WalletConnectSnapshotType = SnapshotOut<typeof WalletConnectModel>;
export interface WalletConnectSnapshot extends WalletConnectSnapshotType {}
export const createWalletConnectDefaultModel = () =>
  types.optional(WalletConnectModel, {
    connected: false,
  });
