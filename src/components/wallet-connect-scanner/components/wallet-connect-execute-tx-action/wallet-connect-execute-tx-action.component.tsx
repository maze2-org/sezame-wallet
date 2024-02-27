import {IWalletConnectAction} from 'models/wallet-connect/wallet-connect.model';
import React from 'react';
import WalletConnectModal from '../wallet-connect-modal/wallet-connect-modal.component';
import {useStores} from 'models';
import {View} from 'react-native';
import {Button, Text} from 'components';

type WalletConnectExecuteTxActionProps = {
  walletAction: IWalletConnectAction;
};
function WalletConnectExecuteTxAction({
  walletAction,
}: WalletConnectExecuteTxActionProps) {
  const {walletConnectStore} = useStores();
  const {removeAction, acceptAlphTx, refuseAlphTx} = walletConnectStore;

  const onCancel = () => {
    refuseAlphTx(walletAction);
  };

  return (
    <WalletConnectModal title={`Confirm a tx...`} onClose={onCancel}>
      <View style={{display: 'flex', flexDirection: 'column'}}>
        <Button onPress={() => acceptAlphTx(walletAction)}>
          <Text>Accept</Text>
        </Button>
        <Button onPress={() => refuseAlphTx(walletAction)}>
          <Text>Refuse</Text>
        </Button>
      </View>
    </WalletConnectModal>
  );
}

export default WalletConnectExecuteTxAction;
