import React, {useRef} from 'react';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {Screen, Text} from '../../components';
import {observer} from 'mobx-react-lite';
import {NavigatorParamList} from 'navigators';
import {FC} from 'react';
import {color} from 'theme';
import {RootPageStyle} from 'theme/elements';
import {IWalletAsset, useStores} from 'models';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Chains, WalletGenerator} from '@maze2/sezame-sdk';
import {useNavigation} from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';
import AddressEntry from './components/address-entry/address-entry.component';
import AddAddress from './components/add-address/add-address.component';
import {addDerivedAddress} from 'utils/wallet-utils';

export const AlphChooseAddressScreen: FC<
  StackScreenProps<NavigatorParamList, 'alphChooseAddress'>
> = observer(function AlphChooseAddressScreen() {
  const {currentWalletStore} = useStores();
  const {getAssetById, setSelectedAddress, getSelectedAddressForAsset} =
    currentWalletStore;

  const asset = getAssetById('alephium', 'ALPH');
  const alphSelectedAddress = getSelectedAddressForAsset('alephium', 'ALPH');

  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  const onSelectAddress = (address: string) => {
    setSelectedAddress(address, 'ALPH');
    navigation.goBack();
  };

  const handleAddDerivedAddress = async (group?: 1 | 2 | 3 | 0) => {
    if (asset && currentWalletStore.mnemonic) {
      await addDerivedAddress(currentWalletStore, asset, group);
    }
  };

  const modalFlashRef = useRef<FlashMessage>();

  return (
    <Screen
      unsafe
      style={RootPageStyle}
      preset="scroll"
      backgroundColor={color.palette.black}>
      <ScrollView style={{padding: 16}}>
        <Text
          style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: 16,
            fontSize: 24,
            textTransform: 'uppercase',
            fontWeight: '600',
          }}>
          Choose your Alephium address
        </Text>
        <View style={{display: 'flex', gap: 4}}>
          <AddressEntry
            onSelectWallet={onSelectAddress}
            asset={asset as IWalletAsset}
            selected={asset?.address === alphSelectedAddress?.address}
            modalFlashRef={modalFlashRef}
          />
          {asset?.derivedAddresses.map(derivedAddress => (
            <AddressEntry
              key={derivedAddress.address}
              onSelectWallet={onSelectAddress}
              asset={derivedAddress}
              selected={
                derivedAddress?.address === alphSelectedAddress?.address
              }
              modalFlashRef={modalFlashRef}
            />
          ))}
          <AddAddress
            onAddAddress={(group?: 1 | 2 | 3 | 0) =>
              handleAddDerivedAddress(group)
            }
          />
        </View>
      </ScrollView>
      <FlashMessage ref={modalFlashRef} position="bottom" />
    </Screen>
  );
});
