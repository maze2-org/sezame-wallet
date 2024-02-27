import {useStores} from 'models';
import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';

import {
  CameraHighlights,
  useBarcodeScanner,
} from '@mgcrea/vision-camera-barcode-scanner';

import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';

import {Camera} from 'react-native-vision-camera';

import {color} from 'theme';
import {Button} from 'components';
import {
  IWalletConnectAction,
  WalletConnectActionType,
  WalletConnectModel,
} from 'models/wallet-connect/wallet-connect.model';
import {observer} from 'mobx-react-lite';
import AlephiumAddressSelector from 'components/alephium/alephium-address-selector.component';
import {ScrollView} from 'react-native-gesture-handler';
import AddressEntry from 'screens/alph-choose-address/components/address-entry/address-entry.component';
import FlashMessage from 'react-native-flash-message';
import AddAddress from 'screens/alph-choose-address/components/add-address/add-address.component';
import {addDerivedAddress} from 'utils/wallet-utils';
import WalletConnectConnectionAction from './components/wallet-connect-connection-action/wallet-connect-connection-action.component';
import WalletConnectExecuteTxAction from './components/wallet-connect-execute-tx-action/wallet-connect-execute-tx-action.component';

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
    const {
      walletConnectStore,
      setWalletConnectSscannerShown,
      currentWalletStore,
    } = useStores();
    const {hasPermission, requestPermission} = useCameraPermission();
    const [scannedCode, setScannedCode] = useState<string>('');
    const device = useCameraDevice('back');

    const {getSelectedAddressForAsset} = currentWalletStore;

    const alphSelectedAddress = getSelectedAddressForAsset('alephium', 'ALPH');
    // const [pendingSessionApproval, setPendingSessionApproval] = useState<any[]>(
    //   [],
    // );

    const {
      approveConnection,
      client,
      init: initWalletConnect,
      nextActions,
    } = walletConnectStore;

    const onClose = () => {
      setWalletConnectSscannerShown(false);
    };

    if (visible && !hasPermission) {
      requestPermission().then(response => {
        console.log('get response', response);
      });
    }

    const setScannedCodeJs = Worklets.createRunInJsFn(setScannedCode);
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

    useEffect(() => {
      if (!client) {
        initWalletConnect();
      }
    }, [client]);

    const nextAction = nextActions?.[0];

    // Handle the different screens based on the action type
    if (nextAction) {
      switch (nextAction.action as WalletConnectActionType) {
        case 'sessionProposal':
          return <WalletConnectConnectionAction walletAction={nextAction} />;
        case 'alph_signAndSubmitExecuteScriptTx':
          return <WalletConnectExecuteTxAction walletAction={nextAction} />;
      }
    }
    console.log('passed2');
    return (
      <Modal
        transparent
        animationType={'fade'}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity activeOpacity={1} style={CONTAINER} onPress={onClose}>
          <View style={CONTAINER_INNER}>
            <TouchableOpacity activeOpacity={1} style={WALLETCONNECT_BOX}>
              <Text style={{fontSize: 18, color: color.palette.white}}>
                Scan the QRCode
              </Text>
              <Text style={{color: color.palette.white}}>
                {nextActions.length} actions remaining
              </Text>
              <TextInput
                style={{width: '100%', height: 80, backgroundColor: 'white'}}
                onChangeText={onChangeText}
              />

              {scannedCode && (
                <>
                  <Text style={{color: color.palette.white}}>
                    Code scanned : {scannedCode}
                  </Text>
                  <Button onPress={() => setScannedCode('')}>
                    <Text>Scan a new bar code</Text>
                  </Button>
                </>
              )}
              {!scannedCode && (
                <View style={{flex: 1, width: '100%', marginTop: 20}}>
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
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  },
);
