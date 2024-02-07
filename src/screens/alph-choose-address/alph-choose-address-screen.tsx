import React, {useEffect, useRef, useState} from 'react';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {Button, Screen, Text} from '../../components';
import {observer} from 'mobx-react-lite';
import {NavigatorParamList} from 'navigators';
import {FC} from 'react';
import {color} from 'theme';
import {RootPageStyle} from 'theme/elements';
import {IWalletAsset, useStores} from 'models';
import {Animated, SafeAreaView, View} from 'react-native';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {Chains, WalletGenerator} from '@maze2/sezame-sdk';
import {WalletDescription} from '@maze2/sezame-sdk/dist/utils/types/WalletDescription';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {palette} from 'theme/palette';
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import FlashMessage from 'react-native-flash-message';
import {SvgXml} from 'react-native-svg';
import copyImg from '@assets/svg/copy.svg';

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

  const addDerivedAddress = async (group?: 1 | 2 | 3 | 0) => {
    let result: WalletDescription | null = null;
    if (asset && currentWalletStore) {
      const indexUsed = [asset.index || 0];
      for (const derived of asset.derivedAddresses) {
        indexUsed.push(derived.index || 0);
      }

      result = await WalletGenerator.generateKeyPairFromMnemonic(
        `${currentWalletStore?.mnemonic}`,
        asset.chain as Chains,
        0,
        indexUsed,
        group,
      );
    }

    if (asset && result) {
      await currentWalletStore.addDerivedAddress(asset, {
        address: result.address,
        balance: 0,
        freeBalance: 0,
        privateKey: result.privateKey,
        publicKey: result.publicKey,
        rate: asset.rate,
        stakedBalance: 0,
        unconfirmedBalance: 0,
        unlockedBalance: 0,
        unstakedBalance: 0,
        value: 0,
        version: 1,
        derivationIndex: 1,
        index: result.index || 0,
        group: `${result.group}`,
      });
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
          <Address
            onSelectWallet={onSelectAddress}
            asset={asset as IWalletAsset}
            selected={asset?.address === alphSelectedAddress?.address}
            modalFlashRef={modalFlashRef}
          />
          {asset?.derivedAddresses.map(derivedAddress => (
            <Address
              key={derivedAddress.address}
              onSelectWallet={onSelectAddress}
              asset={derivedAddress as IWalletAsset}
              selected={
                derivedAddress?.address === alphSelectedAddress?.address
              }
              modalFlashRef={modalFlashRef}
            />
          ))}
          <AddAddress
            onAddAddress={(group?: 1 | 2 | 3 | 0) => addDerivedAddress(group)}
          />
        </View>
      </ScrollView>
      <FlashMessage ref={modalFlashRef} position="bottom" />
    </Screen>
  );
});

function AddAddress({
  onAddAddress,
}: {
  onAddAddress: (group?: 1 | 2 | 3 | 0) => any;
}) {
  const [selectedGroup, setSelectedGroup] = useState<
    1 | 2 | 3 | 0 | undefined
  >();

  const handleAddAddress = () => {
    onAddAddress(selectedGroup);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 72,
        borderWidth: 1,
        borderColor: color.palette.gold,
        borderRadius: 12,
        padding: 16,
        borderStyle: 'dashed',
        marginLeft: 10,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 8,
        }}>
        <Text>Generate a new address</Text>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <View
            style={{
              flex: 1,
              flexGrow: 1,
            }}>
            <RNPickerSelect
              style={{
                inputIOSContainer: {
                  backgroundColor: 'black',
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  borderWidth: 1,
                  borderColor: color.palette.gold,
                  padding: 16,
                  flexDirection: 'row', // Pour aligner l'icône et le texte horizontalement
                  alignItems: 'center', // Pour centrer verticalement l'icône
                },
                inputIOS: {
                  color: color.palette.gold,
                },
              }}
              onValueChange={value =>
                setSelectedGroup(
                  value ? (parseInt(value) as 0 | 1 | 2 | 3) : undefined,
                )
              }
              Icon={() => (
                <FontAwesomeIcon
                  name={'chevron-down'}
                  color={color.palette.gold}
                  style={{paddingRight: 8}}
                />
              )}
              items={[
                {label: 'Auto', value: undefined},
                {label: 'Group 0', value: 0},
                {label: 'Group 1', value: 1},
                {label: 'Group 2', value: 2},
                {label: 'Group 3', value: 3},
              ]}
            />
          </View>
          <View>
            <Button
              onPress={handleAddAddress}
              style={{
                flex: 1,
                borderBottomLeftRadius: 0,
                borderTopLeftRadius: 0,
              }}>
              <Text>Create</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function Address({
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
      }}>
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
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
