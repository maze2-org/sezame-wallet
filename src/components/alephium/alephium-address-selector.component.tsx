import {useStores} from 'models';
import * as React from 'react';
import { Image, Text, View } from "react-native"

import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NavigatorParamList} from 'navigators/app-navigator.tsx';
import {color} from 'theme';
import {observer} from 'mobx-react-lite';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useMemo } from "react"
const tokens = require('@config/tokens.json');

interface IAlephiumAddressSelectorProps{
  chain?:string
  coinId?:string
}

const AlephiumAddressSelector:React.FC<IAlephiumAddressSelectorProps> = observer(({chain = "ALPH",coinId = 'alephium'}) => {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {currentWalletStore} = useStores();
  const {getSelectedAddressForAsset, getAssetById, assets} = currentWalletStore;

  const alphSelectedAddress = getSelectedAddressForAsset(coinId, chain);

  const assetImage = useMemo(()=>{
    const foundedAsset = tokens?.find((token)=> coinId === token.id)
    return foundedAsset ? foundedAsset.thumb : null;
  },[coinId])

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
        onPress={() => navigation.navigate("alphChooseAddress", { chain, coinId })}>
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
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                margin: 'auto',
                alignSelf: 'stretch',
              }}>
             <View>
               {assetImage ?
                 <View style={{ flexDirection:'row', alignItems: "center", gap: 4 }}>
                   <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 2 }}>
                     <Image source={{ uri: assetImage }} width={12} height={12} />
                   </View>
                   <Text
                     style={{
                       color: color.palette.white,
                       flexGrow: 1,
                     }}>
                     {alphSelectedAddress.balance}
                   </Text>
                 </View>
                 :
                 <Text
                   style={{
                     color: color.palette.white,
                     flexGrow: 1,
                     textAlign: "center",
                   }}>
                   {alphSelectedAddress.balance} א
                 </Text>}
             </View>
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
