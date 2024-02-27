import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {IWalletAsset} from 'models';
import {useEffect, useState} from 'react';
import {Animated, View} from 'react-native';
import FlashMessage from 'react-native-flash-message';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {SvgXml} from 'react-native-svg';
import {color} from 'theme';
import copyImg from '@assets/svg/copy.svg';
import {Text} from 'components';
import {palette} from 'theme/palette';

function AddressEntry({
  asset,
  selected,
  onSelectWallet,
  modalFlashRef,
}: {
  asset: IWalletAsset;
  selected: boolean;
  onSelectWallet: (address: string) => any;
  modalFlashRef: React.MutableRefObject<FlashMessage | undefined>;
}) {
  const [scaleValue] = useState(new Animated.Value(1));

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

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: selected ? 1 : 0.9,
      useNativeDriver: false,
      speed: 10,
    }).start();
  }, [selected]);

  return (
    <Animated.View
      style={{
        transform: [{scale: scaleValue}],
      }}
      style={{width: '100%'}}>
      <TouchableOpacity
        style={{
          alignSelf: 'center',
          display: 'flex',
          flexDirection: 'column',
          paddingVertical: 8,
          paddingHorizontal: 16,
          gap: 2,
          alignItems: 'center',
          backgroundColor: 'black',
          borderRadius: 16,
          marginVertical: 8,
          borderWidth: 1,
          overflow: 'hidden',
        }}
        onPress={() => onSelectWallet(asset.address)}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 16,
          }}>
          <TouchableOpacity
            onPress={() => copyAddress(asset?.address)}
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}>
            <View>
              <SvgXml stroke={color.palette.gold} xml={copyImg} height={20} />
            </View>
          </TouchableOpacity>
          <View style={{flexShrink: 1}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
              }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="middle"
                style={{flexShrink: 1, color: color.palette.gold}}>
                {asset.address}
              </Text>
            </View>

            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                margin: 'auto',
                alignSelf: 'stretch',
              }}>
              <Text
                style={{
                  color: color.palette.white,
                  flexGrow: 1,
                  textAlign: 'center',
                }}>
                {asset.balance} א
              </Text>
            </View>
          </View>
          <View style={{justifyContent: 'center'}}>
            <View style={{borderRadius: 16, backgroundColor: color.primary}}>
              <Text
                style={{
                  fontSize: 12,
                  color: palette.black,
                  fontWeight: 'bold',

                  borderRadius: 16,
                  paddingHorizontal: 4,
                  paddingVertical: 4,
                }}>
                Group {asset.group}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
export default AddressEntry;
