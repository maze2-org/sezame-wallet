import React, {useState} from 'react';

import {ALPH_TOKEN_ID, NodeProvider, ONE_ALPH} from '@alephium/web3';
import {PrivateKeyWallet} from '@alephium/web3-wallet';
import {View, ScrollView, Button, Text} from 'react-native';
import {
  CHAIN_ID_ETH,
  MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
  transferLocalTokenFromAlph,
} from '@alephium/wormhole-sdk';
import * as alephiumMainnetConfig from '../../bridges/alephium/artifacts/.deployments.mainnet.json';

const nodeProvider = new NodeProvider(`https://node-v20.mainnet.alephium.org`);

const signer = new PrivateKeyWallet({
  privateKey: `6d91fdad6ae79679f284f76bf0eec2d730cb050cb81738745c150f4c97c02197`,
  nodeProvider,
});

function DebugBridge(): React.JSX.Element {
  const [result, setResult] = useState<any>(null);

  const bridgeAmount = async (amount: bigint) => {
    setResult('Please wait...');

    try {
      const result = await transferLocalTokenFromAlph(
        signer,
        alephiumMainnetConfig.contracts.TokenBridge.contractInstance.contractId,
        signer.account.address,
        ALPH_TOKEN_ID,
        CHAIN_ID_ETH,
        alephiumMainnetConfig.contracts.TokenBridge.contractInstance.address,
        amount,
        0n,
        0n,
        MAINNET_ALPH_MINIMAL_CONSISTENCY_LEVEL,
      );
      console.log('Result of the transaction:', result);
      setResult(result);
    } catch (err) {
      console.log('ERROR', err);
      setResult(err);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{}}>
        <Text>Using wallet address : {signer.account.address}</Text>
        <Button
          title="Brige 0.01 ALPH"
          color={'red'}
          onPress={() => bridgeAmount(ONE_ALPH / 100n)}></Button>

        <Text>{JSON.stringify(result, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}

export default DebugBridge;
