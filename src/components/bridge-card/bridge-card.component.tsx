import {BaseWalletDescription, IWalletAsset} from 'models';
import React from 'react';
import {Linking, Text, View} from 'react-native';
import {Card} from 'components/card/card.component';

import styles from './bridge-card.styles';
import {spacing} from 'theme';
import {Button} from 'components/button/button';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {NavigatorParamList} from 'navigators';

type BridgeCardPropsType = {
  from: BaseWalletDescription;
};

export function BridgeCard({from}: BridgeCardPropsType) {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();

  const navigateToBridge = (e: any) => {
    // @TODO : Re-introduce the bridge page once we have a way to use the alephium sdk properly

    // navigation.navigate('bridge', {
    //   coinId: from.cid,
    //   chain: from.chain,
    // });

    Linking.openURL('https://bridge.alephium.org/#/transfer');
  };

  return (
    <Card title="Bridge">
      <View style={{paddingTop: spacing[4]}}>
        {from.group !== '0' ? (
          <Text style={styles.DANGER}>
            Brige is only compatible with addresses on group 0. The current one
            is on group {from.group}
          </Text>
        ) : (
          <View style={{display: 'flex', gap: 16}}>
            <Text style={styles.BODY}>Send to ETH network</Text>
            <Button
              text="Go to alephium bridge website *"
              preset="primary"
              onPress={navigateToBridge}
            />
            <Text style={styles.BODY}>* Soon embeded in sezame</Text>
          </View>
        )}
      </View>
    </Card>
  );
}
