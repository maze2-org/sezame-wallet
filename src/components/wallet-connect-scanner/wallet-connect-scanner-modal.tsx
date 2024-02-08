import {useStores} from 'models';
import React, {useState} from 'react';
import {
  Modal,
  View,
  ViewStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  CameraHighlights,
  useBarcodeScanner,
} from '@mgcrea/vision-camera-barcode-scanner';

import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';

import {Camera} from 'react-native-vision-camera';

import {color} from 'theme';
import {Button} from 'components';

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

export function WalletConnectScannerModal({
  visible,
}: WalletConnectScannerModalProps) {
  const {setWalletConnectSscannerShown} = useStores();
  const {hasPermission, requestPermission} = useCameraPermission();

  const onClose = () => {
    setWalletConnectSscannerShown(false);
  };

  const device = useCameraDevice('back');

  if (visible && !hasPermission) {
    requestPermission().then(response => {
      console.log('get response', response);
    });
  }

  const [scannedCode, setScannedCode] = useState<string>('');
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
                  <Text>No camera detected</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
