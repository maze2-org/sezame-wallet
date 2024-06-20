import {useStores} from 'models';
import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  TextStyle,
} from 'react-native';

import {
  CameraHighlights,
  useBarcodeScanner,
} from '@mgcrea/vision-camera-barcode-scanner';

import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';

import {Camera} from 'react-native-vision-camera';

import {color} from 'theme';
import {Button} from 'components';
import {WalletConnectActionType} from 'models/wallet-connect/wallet-connect.model';
import {observer} from 'mobx-react-lite';
import WalletConnectConnectionAction from './components/wallet-connect-connection-action/wallet-connect-connection-action.component';
import {
  JsonRpcRecord,
  MessageRecord,
  PendingRequestTypes,
  SessionTypes,
} from '@walletconnect/types';
import {KeyValueStorage} from '@walletconnect/keyvaluestorage';
import {
  CORE_STORAGE_OPTIONS,
  CORE_STORAGE_PREFIX,
  HISTORY_CONTEXT,
  HISTORY_STORAGE_VERSION,
  MESSAGES_CONTEXT,
  MESSAGES_STORAGE_VERSION,
  STORE_STORAGE_VERSION,
} from '@walletconnect/core';
import {mapToObj, objToMap} from '@walletconnect/utils';
import {
  REQUEST_CONTEXT,
  SESSION_CONTEXT,
  SIGN_CLIENT_STORAGE_PREFIX,
} from '@walletconnect/sign-client';
import {SvgXml} from 'react-native-svg';
import walletConnectIcon from '@assets/svg/walletconnect.svg';
import {INPUT, textInput} from 'theme/elements';
import {TextInputField} from 'components/text-input-field/text-input-field';

type WalletConnectScannerModalProps = {
  visible: boolean;
  onClose: () => void;
};

const CONTAINER: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.8)',
};

const CONTAINER_INNER: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
};

const WALLET_CONNECT_ICON = {
  width: 45,
  height: 45,
};
const SCAN_TEXT: TextStyle = {
  fontSize: 18,
  marginTop: 12,
  marginBottom: 12,
  color: color.palette.white,
};

const WALLETCONNECT_BOX: ViewStyle = {
  width: '90%',
  height: '60%',
  borderRadius: 8,
  alignItems: 'center',
  padding: 16,
  //   justifyContent: 'center',
  backgroundColor: color.palette.darkBrown,
};

export const WalletConnectScannerModal = observer(
  function WalletConnectScannerModal({
    visible,
  }: WalletConnectScannerModalProps) {
    const {walletConnectStore, setWalletConnectSscannerShown} = useStores();
    const {hasPermission, requestPermission} = useCameraPermission();
    const [scannedCode, setScannedCode] = useState<string>('');
    const device = useCameraDevice('back');

    const {client, init: initWalletConnect, nextActions} = walletConnectStore;

    const onClose = () => {
      setWalletConnectSscannerShown(false);
    };

    if (visible && !hasPermission) {
      requestPermission().then(response => {
        console.log('get response', response);
      });
    }

    const setScannedCodeJs = Worklets.createRunOnJS(setScannedCode);
    const {props: cameraProps, highlights} = useBarcodeScanner({
      fps: 20,
      barcodeTypes: ['qr'],
      onBarcodeScanned: barcodes => {
        'worklet';
        if (barcodes[0].value) {
          setScannedCodeJs(barcodes[0].value);
        }
      },
    });

    useEffect(() => {
      if (scannedCode) {
        walletConnectStore.connect(scannedCode);
      }
    }, [scannedCode]);

    const onChangeText = (value: string) => {
      setScannedCode(value);
    };

    const MaxRequestNumToKeep = 10;

    function getWCStorageKey(
      prefix: string,
      version: string,
      name: string,
    ): string {
      return prefix + version + '//' + name;
    }

    function isApiRequest(record: JsonRpcRecord): boolean {
      const request = record.request;
      if (request.method !== 'wc_sessionRequest') {
        return false;
      }
      const alphRequestMethod = request.params?.request?.method;
      return (
        alphRequestMethod === 'alph_requestNodeApi' ||
        alphRequestMethod === 'alph_requestExplorerApi'
      );
    }

    async function cleanBeforeInit() {
      console.log('Clean storage before SignClient init');
      const storage = new KeyValueStorage({...CORE_STORAGE_OPTIONS});
      const historyStorageKey = getWCStorageKey(
        CORE_STORAGE_PREFIX,
        HISTORY_STORAGE_VERSION,
        HISTORY_CONTEXT,
      );
      const historyRecords =
        await storage.getItem<JsonRpcRecord[]>(historyStorageKey);

      if (historyRecords !== undefined) {
        const remainRecords: JsonRpcRecord[] = [];
        let alphSignRequestNum = 0;
        let unresponsiveRequestNum = 0;
        const now = Date.now();

        for (const record of historyRecords.reverse()) {
          const msToExpiry = (record.expiry || 0) * 1000 - now;

          if (msToExpiry <= 0) continue;

          const requestMethod = record.request.params?.request?.method as
            | string
            | undefined;

          if (
            requestMethod?.startsWith('alph_sign') &&
            alphSignRequestNum < MaxRequestNumToKeep
          ) {
            remainRecords.push(record);
            alphSignRequestNum += 1;
          } else if (
            record.response === undefined &&
            !isApiRequest(record) &&
            unresponsiveRequestNum < MaxRequestNumToKeep
          ) {
            remainRecords.push(record);
            unresponsiveRequestNum += 1;
          }
        }

        await storage.setItem<JsonRpcRecord[]>(
          historyStorageKey,
          remainRecords.reverse(),
        );
      }

      await cleanPendingRequest(storage);

      const topics = await getSessionTopics(storage);
      if (topics.length > 0) {
        const messageStorageKey = getWCStorageKey(
          CORE_STORAGE_PREFIX,
          MESSAGES_STORAGE_VERSION,
          MESSAGES_CONTEXT,
        );
        const messages =
          await storage.getItem<Record<string, MessageRecord>>(
            messageStorageKey,
          );
        if (messages === undefined) {
          return;
        }

        const messagesMap = objToMap(messages);
        topics.forEach(topic => messagesMap.delete(topic));
        await storage.setItem<Record<string, MessageRecord>>(
          messageStorageKey,
          mapToObj(messagesMap),
        );
        console.log(`Clean topics from messages storage: ${topics.join(',')}`);
      }
    }

    async function getSessionTopics(
      storage: KeyValueStorage,
    ): Promise<string[]> {
      const sessionKey = getWCStorageKey(
        SIGN_CLIENT_STORAGE_PREFIX,
        STORE_STORAGE_VERSION,
        SESSION_CONTEXT,
      );
      const sessions = await storage.getItem<SessionTypes.Struct[]>(sessionKey);
      return sessions === undefined
        ? []
        : sessions.map(session => session.topic);
    }

    async function cleanPendingRequest(storage: KeyValueStorage) {
      const pendingRequestStorageKey = getWCStorageKey(
        SIGN_CLIENT_STORAGE_PREFIX,
        STORE_STORAGE_VERSION,
        REQUEST_CONTEXT,
      );
      const pendingRequests = await storage.getItem<
        PendingRequestTypes.Struct[]
      >(pendingRequestStorageKey);
      if (pendingRequests !== undefined) {
        const remainPendingRequests = pendingRequests.filter(request => {
          const method = request.params.request.method;
          return (
            method !== 'alph_requestNodeApi' &&
            method !== 'alph_requestExplorerApi'
          );
        });
        await storage.setItem<PendingRequestTypes.Struct[]>(
          pendingRequestStorageKey,
          remainPendingRequests,
        );
      }
    }

    const clean = async () => {
      await cleanBeforeInit();
    };

    useEffect(() => {
      if (!client) {
        clean().then(() => {
          return initWalletConnect();
        });
      }
    }, [client]);

    const nextAction = nextActions?.[0];

    // Handle the different screens based on the action type
    if (nextAction) {
      switch (nextAction.action as WalletConnectActionType) {
        case 'sessionProposal':
          return <WalletConnectConnectionAction walletAction={nextAction} />;
      }
    }
    return (
      <Modal
        transparent
        animationType={'fade'}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity activeOpacity={1} style={CONTAINER} onPress={onClose}>
          <View style={CONTAINER_INNER}>
            <TouchableOpacity activeOpacity={1} style={WALLETCONNECT_BOX}>
              <SvgXml style={WALLET_CONNECT_ICON} xml={walletConnectIcon} />

              {scannedCode && (
                <>
                  {/* <Text style={{color: color.palette.white}}>
                    Wallet connect url : {scannedCode}
                  </Text> */}
                  <Button onPress={() => setScannedCode('')}>
                    <Text>Scan a new bar code</Text>
                  </Button>
                </>
              )}
              {!scannedCode && (
                <View style={{flex: 1, width: '100%', marginTop: 20}}>
                  <Text style={SCAN_TEXT}>Scan the wallet connect QR code</Text>
                  {device ? (
                    <>
                      <Camera
                        style={{flex: 1, width: '100%'}}
                        device={device}
                        isActive={true}
                        {...cameraProps}
                      />
                      <CameraHighlights
                        highlights={highlights}
                        color={color.palette.gold}
                      />
                    </>
                  ) : (
                    <Text style={{color: color.palette.white}}>
                      No camera detected
                    </Text>
                  )}
                </View>
              )}
              <View style={{marginTop: '20px'}}>
                <TextInputField
                  name="walletConnectAddress"
                  multiline={true}
                  style={textInput}
                  fieldStyle="alt"
                  label="Or paste wallet connect address below"
                  onChangeText={onChangeText}
                />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  },
);
