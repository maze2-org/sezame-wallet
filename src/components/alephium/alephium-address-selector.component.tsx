import {useStores} from 'models';
import * as React from 'react';
import {Text, View} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NavigatorParamList} from 'navigators/app-navigator.tsx';
import {color} from 'theme';
import {observer} from 'mobx-react-lite';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const AlephiumAddressSelector = observer(() => {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {currentWalletStore} = useStores();
  const {getSelectedAddressForAsset, getAssetById, assets} = currentWalletStore;
  const alphSelectedAddress = getSelectedAddressForAsset('alephium', 'ALPH');

  if (!alphSelectedAddress) {
    return <></>;
  }
  return (
    <>
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          display: 'flex',
          flexDirection: 'column',
          paddingVertical: 8,
          paddingHorizontal: 50,
          gap: 2,
          alignItems: 'center',
          borderRadius: 16,
          marginVertical: 8,
          borderWidth: 1,
          maxWidth: 200,
          backgroundColor: 'black',
        }}
        onPress={() => navigation.navigate('alphChooseAddress')}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 16,
            alignItems: 'center',
          }}>
          <View style={{display: 'flex', flexDirection: 'column'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 8,
                flexShrink: 1,
              }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="middle"
                style={{flexShrink: 1, color: color.palette.gold}}>
                {alphSelectedAddress.address}
              </Text>
              <View
                style={{
                  backgroundColor: color.primary,
                  borderRadius: 16,
                  paddingHorizontal: 4,
                  paddingVertical: 4,
                }}>
                <Text style={{fontSize: 8}}>
                  Group {alphSelectedAddress.group}
                </Text>
              </View>
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
                {alphSelectedAddress.balance} א
              </Text>
            </View>
          </View>
          <View>
            <FontAwesomeIcon name={'chevron-down'} color={color.palette.gold} />
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
});

export default AlephiumAddressSelector;
