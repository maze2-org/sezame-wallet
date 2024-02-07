import React, {useEffect, useRef, useState} from 'react';

import {Modal, Pressable, View, Text as TextRn} from 'react-native';
import styles from '../styles';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {color} from 'theme';
import {BaseWalletDescription} from 'models';
import QRCode from 'react-native-qrcode-svg';
import {Text} from 'components';

import {getAddressGroup} from 'services/api';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';
import FlashMessage from 'react-native-flash-message';
import {SvgXml} from 'react-native-svg';
import copyImg from '@assets/svg/copy.svg';

type ReceiveModalProps = {
  visible: boolean;
  onClose: () => any;
  asset: BaseWalletDescription;
};

const ReceiveModal = ({visible, asset, onClose}: ReceiveModalProps) => {
  const copyAddress = (value: string) => {
    if (value) {
      Clipboard.setString(value);
      Clipboard.getString()
        .then(link => {
          modalFlashRef.current &&
            modalFlashRef.current.showMessage({
              message: 'Copied to clipboard',
              type: 'success',
            });
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  const modalFlashRef = useRef<FlashMessage>();
  const [currentAddressGroup, setCurrentAddressGroup] = useState<null | string>(
    null,
  );

  useEffect(() => {
    if (asset) {
      getAddressGroup(asset, `${asset.address}`)
        .then(group => {
          setCurrentAddressGroup(group);
        })
        .catch(err => {
          setCurrentAddressGroup(null);
        });
    } else {
      setCurrentAddressGroup(null);
    }
  }, [asset]);

  return (
    <Modal
      visible={visible}
      animationType={'fade'}
      onRequestClose={() => onClose()}
      transparent>
      <Pressable style={styles.RECEIVE_MODAL_WRAPPER} onPress={() => onClose()}>
        <Pressable style={styles.RECEIVE_MODAL_CONTAINER}>
          <View style={styles.RECEIVE_MODAL_CLOSE_WRAPPER}>
            <Pressable
              style={styles.RECEIVE_MODAL_CLOSE}
              hitSlop={{top: 10, left: 10, right: 10, bottom: 10}}
              onPress={() => onClose()}>
              <IonIcons
                name={'close-outline'}
                size={30}
                color={color.palette.white}
              />
            </Pressable>
          </View>

          {!!asset && (
            <View style={styles.QR_CONTAINER}>
              <QRCode value={asset?.address} size={185} />
            </View>
          )}

          <View style={styles.RECEIVE_MODAL_COPY_WRAPPER}>
            {!!asset && (
              <View style={styles.RECEIVE_MODAL_ADDRESS}>
                <TextRn style={styles.RECEIVE_MODAL_ADDRESS_TEXT}>
                  {asset.address.match(/.{1,5}/g).map(e => {
                    return <Text key={e}>{e} </Text>;
                  })}
                </TextRn>
              </View>
            )}
            {currentAddressGroup && (
              <View style={styles.GROUP_BLOCK}>
                <Text style={styles.GROUP_LABEL}>
                  Group {currentAddressGroup}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.RECEIVE_MODAL_COPY_BUTTON}
              onPress={() => copyAddress(asset?.address)}>
              <View>
                <SvgXml
                  stroke={color.palette.gold}
                  xml={copyImg}
                  height={20}
                  style={styles.COPY_ICON}
                />
                <Text style={styles.RECEIVE_MODAL_COPY_TEXT}>COPY ADDRESS</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.RECEIVE_MODAL_COPY_BUTTON}
              onPress={() => copyAddress(asset?.publicKey)}>
              <View>
                <SvgXml
                  stroke={color.palette.gold}
                  xml={copyImg}
                  height={20}
                  style={styles.COPY_ICON}
                />
                <Text style={styles.RECEIVE_MODAL_COPY_TEXT}>
                  COPY PUBLIC KEY
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
      <FlashMessage ref={modalFlashRef} position="bottom" />
    </Modal>
  );
};

export default ReceiveModal;
