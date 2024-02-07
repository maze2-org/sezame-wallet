import RNWalletConnect from '@walletconnect/client';

const CLIENT_META = {
  description: 'Sezame Wallet',
  url: 'https://sesame-wallet.io/',
  icons: ['https://sesame-wallet.io/assets/logo.png'],
  name: 'Sezame',
  ssl: true,
};
export const WALLET_CONNECT_STATUS = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  SESSION_REQUEST: 'session_request',
  SEND_TRANSACTION: 'send_transaction',
  SIGN_TRANSACTION: 'sign_transaction',
  SIGN_MESSAGE: 'sign_message',
  SIGN_TYPED_DATA: 'sign_typed_data',
  SIGN_PERSONAL_MESSAGE: 'sign_personal_message',
  DISCONNECTED: 'disconnected',
};

export class WalletConnect {
  walletConnector: any;
  walletConnectStore: any;

  rejectSession = async () => {
    if (this.walletConnector) {
      await this.walletConnector.rejectSession();
    }
  };

  acceptSession = async (chainId, address) => {
    if (this.walletConnector) {
      const approveData = {
        chainId: chainId,
        accounts: [address],
      };
      this.walletConnectStore.setStatus(WALLET_CONNECT_STATUS.CONNECTED);
      await this.walletConnector.approveSession(approveData);
    }
  };

  closeSession = async () => {
    if (this.walletConnector) {
      this.walletConnector.killSession();
    }
  };

  approveRequest = async data => {
    this.walletConnector.approveRequest(data);
    this.walletConnectStore.setStatus(WALLET_CONNECT_STATUS.CONNECTED);
    this.walletConnectStore.setTransactionData(null);
  };

  rejectRequest = async data => {
    this.walletConnector.rejectRequest(data);
    this.walletConnectStore.setStatus(WALLET_CONNECT_STATUS.CONNECTED);
    this.walletConnectStore.setTransactionData(null);
  };

  onDisconnect() {
    this.walletConnectStore.setPeerMeta({
      url: '',
      description: '',
      icons: [],
      name: '',
    });
    this.walletConnectStore.setChainId(0);
    this.walletConnectStore.setStatus(WALLET_CONNECT_STATUS.DISCONNECTED);
  }

  init(walletConnectStore, options) {
    this.walletConnectStore = walletConnectStore;
    if (this.walletConnector) {
      // Disconnect previous connection
      this.walletConnector.killSession();
    }
    this.walletConnectStore.setStatus(WALLET_CONNECT_STATUS.CONNECTING);
    try {
      this.walletConnector = new RNWalletConnect({
        ...options,
        clientMeta: CLIENT_META,
      });
    } catch (e) {
      this.walletConnectStore.setStatus(WALLET_CONNECT_STATUS.DISCONNECTED);
      console.log('Error connecting to walletconnect', e);
      return false;
    }
    this.walletConnector.on('session_request', async (error, payload) => {
      if (error) {
        console.log('Error connecting to walletconnect', error);

        throw error;
      }
      console.log(payload);
      try {
        const sessionData = {
          ...payload.params[0],
          autosign: false,
        };
        console.log('WC:', sessionData);
        console.log('peer', sessionData.peerMeta);
        this.walletConnectStore.setPeerMeta(sessionData.peerMeta);
        this.walletConnectStore.setChainId(sessionData.chainId);
        this.walletConnectStore.setStatus(
          WALLET_CONNECT_STATUS.SESSION_REQUEST,
        );
      } catch (e) {
        console.log(e);
        this.walletConnector.rejectSession();
      }
    });
    this.walletConnector.on('call_request', async (error, payload) => {
      if (error) {
        console.log('Error connecting to walletconnect', error);

        throw error;
      }
      console.log(payload);

      if (payload.method) {
        this.walletConnectStore.setTransactionData(payload);
        if (payload.method === 'eth_sendTransaction') {
          this.walletConnectStore.setStatus(
            WALLET_CONNECT_STATUS.SEND_TRANSACTION,
          );
        } else if (payload.method === 'eth_sign') {
          this.walletConnectStore.setStatus(
            WALLET_CONNECT_STATUS.SIGN_TRANSACTION,
          );
        } else if (payload.method === 'personal_sign') {
          this.walletConnectStore.setStatus(
            WALLET_CONNECT_STATUS.SIGN_PERSONAL_MESSAGE,
          );
        } else if (payload.method && payload.method === 'eth_signTypedData') {
          this.walletConnectStore.setStatus(
            WALLET_CONNECT_STATUS.SIGN_TYPED_DATA,
          );
        }
      }
    });
    this.walletConnector.on('disconnect', error => {
      console.log('disconnect', error);
      if (error) {
        console.log('Error connecting to walletconnect', error);

        throw error;
      }
      this.walletConnector = null;

      this.onDisconnect();
    });

    this.walletConnector.on('session_update', (error, payload) => {
      console.log('session_update', error, payload);
      if (error) {
        console.log('Error connecting to walletconnect', error);

        throw error;
      }
    });
    return true;
  }
}
export const walletConnectService = new WalletConnect();
