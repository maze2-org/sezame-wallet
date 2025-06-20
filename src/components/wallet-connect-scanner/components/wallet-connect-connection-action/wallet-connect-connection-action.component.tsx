import React, {useEffect, useRef} from 'react';
import SignClient from '@walletconnect/sign-client';
import FlashMessage from 'react-native-flash-message';
import {observer} from 'mobx-react-lite';
import {Image, View, ViewStyle} from 'react-native';

import AddAddress from 'screens/alph-choose-address/components/add-address/add-address.component';
import AddressEntry from 'screens/alph-choose-address/components/address-entry/address-entry.component';
import WalletConnectModal from '../wallet-connect-modal/wallet-connect-modal.component';
import {color} from 'theme';
import {useStores} from 'models';
import {Button, Text} from 'components';
import {addDerivedAddress} from 'utils/wallet-utils';
import {IWalletConnectAction} from 'models/wallet-connect/wallet-connect.model';

type WalletConnectConnectionActionProps = {
  walletAction: IWalletConnectAction;
};

const WalletConnectConnectionAction = observer(function ({
  walletAction,
}: WalletConnectConnectionActionProps) {
  const {currentWalletStore, walletConnectStore} = useStores();
  const modalFlashRef = useRef<FlashMessage>();
  const {getSelectedAddressForAsset, getAssetById, setSelectedAddress} =
    currentWalletStore;
  const alphWallet = getAssetById('alephium', 'ALPH');
  const alphSelectedAddress = getSelectedAddressForAsset('alephium', 'ALPH');
  const ethSelectedAddress = getSelectedAddressForAsset('alephium', 'ETH');
  const {removeAction, approveConnection, rejectConnection, client} =
    walletConnectStore;

  const handleAddDerivedAddress = async (group?: 1 | 2 | 3 | 0) => {
    if (alphWallet && currentWalletStore.mnemonic) {
      await addDerivedAddress(currentWalletStore, alphWallet, group);
    }
  };

  const getActiveWalletConnectSessions = (walletConnectClient?: SignClient) => {
    if (!walletConnectClient) return [];

    const activePairings = walletConnectClient.core.pairing
      .getPairings()
      .filter(pairing => pairing.active);

    return walletConnectClient.session.values.filter(session =>
      activePairings.some(pairing => pairing.topic === session.pairingTopic),
    );
  };

  const handleConnect = async (
    pendingSessionApproval: IWalletConnectAction,
  ) => {
    try {
      if (alphSelectedAddress || ethSelectedAddress) {
        const activeSessions = getActiveWalletConnectSessions(client);
        await approveConnection(
          pendingSessionApproval,
          alphSelectedAddress,
          activeSessions,
          ethSelectedAddress,
        );
      } else {
        alert('Missing APLH or ETH token!')
      }
    } catch (err) {
      console.log('handleConnect error ----------------', err);
      // ignore error...
    } finally {
    }
  };

  const handleReject = async (pendingSessionApproval: IWalletConnectAction) => {
    try {
      await rejectConnection(pendingSessionApproval);
    } catch (err) {
      // ignore error...
      console.log('unable to reject', err);
    } finally {
    }
  };

  const onSelectAddress = (address: string) => {
    setSelectedAddress(address, 'ALPH', 'alephium');
  };

  const onCancel = () => {
    removeAction(walletAction);
  };

  useEffect(() => {
    if (walletAction.status === 'require_alph_group_switch') {
      handleConnect(walletAction);
    }
  }, [alphSelectedAddress]);

  if (
    walletAction?.status === 'require_alph_group_switch' &&
    walletAction?.alephiumGroup !== undefined &&
    alphSelectedAddress?.group !== walletAction.alephiumGroup
  ) {
    return (
      <WalletConnectModal
        title={`Address from group ${walletAction.alephiumGroup} required`}
        onClose={onCancel}>
        <View
          style={{
            display: 'flex',
            gap: 4,
            width: '100%',
          }}>
          {alphWallet?.group === walletAction.alephiumGroup && (
            <AddressEntry
              onSelectWallet={onSelectAddress}
              asset={alphWallet}
              selected={alphWallet?.address === alphSelectedAddress?.address}
              modalFlashRef={modalFlashRef}
            />
          )}
          {alphWallet?.derivedAddresses
            .filter(
              derivedAddress =>
                derivedAddress.group === walletAction.alephiumGroup,
            )
            .map(derivedAddress => (
              <AddressEntry
                key={derivedAddress.address}
                onSelectWallet={onSelectAddress}
                asset={derivedAddress as any}
                selected={
                  derivedAddress?.address === alphSelectedAddress?.address
                }
                modalFlashRef={modalFlashRef}
              />
            ))}
          <AddAddress
            forceGroup={parseInt(walletAction.alephiumGroup) as 1 | 2 | 3 | 0}
            onAddAddress={(group?: 1 | 2 | 3 | 0) =>
              handleAddDerivedAddress(group)
            }
          />
        </View>
      </WalletConnectModal>
    );
  }

  if (walletAction?.action == 'sessionProposal') {
    return (
      <WalletConnectModal
        title="Wallet connect connection requested"
        onClose={onCancel}
        flashMessageRef={modalFlashRef}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
          }}>
          {walletAction.logo && (
            <Image
              style={{
                margin: 'auto',
                alignSelf: 'center',
                marginBottom: 16,
              }}
              source={{
                uri: walletAction.logo,
                width: 200,
                height: 200,
              }}
            />
          )}
          <Text
            style={{
              fontSize: 22,
              textAlign: 'center',
              color: color.palette.white,
            }}>
            {walletAction.title}
          </Text>

          <Text style={{color: color.palette.white, marginVertical: 16}}>
            {walletAction.description}
          </Text>

          <View style={BUTTONS_WRAPPER}>
            <Button
              style={APPROVE_BUTTON}
              onPress={() => handleConnect(walletAction)}>
              <Text>Approve</Text>
            </Button>
            <Button
              style={DANGER_BUTTON}
              onPress={() => handleReject(walletAction)}>
              <Text>Reject</Text>
            </Button>
          </View>
        </View>
      </WalletConnectModal>
    );
  }

  return <></>;
});

export default WalletConnectConnectionAction;

const BUTTONS_WRAPPER: ViewStyle = {
  gap: 10,
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
};

const DANGER_BUTTON: ViewStyle = {
  width: '50%',
  backgroundColor: '#cc0100',
};

const APPROVE_BUTTON: ViewStyle = {
  width: '50%',
};
