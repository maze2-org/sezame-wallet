import { IWalletConnectAction } from "models/wallet-connect/wallet-connect.model"
import React from "react"
import WalletConnectModal from "../wallet-connect-modal/wallet-connect-modal.component"
import { useStores } from "models"
import { StyleSheet, View } from "react-native"
import { Button, Text } from "components"

type WalletConnectExecuteTxActionProps = {
  visible?: boolean
  walletAction: IWalletConnectAction;
  sessionRequestData?: any,
};

function WalletConnectExecuteTxAction({
                                        visible,
                                        walletAction,
                                        sessionRequestData,
                                      }: WalletConnectExecuteTxActionProps) {
  const { walletConnectStore, currentWalletStore } = useStores()
  const { acceptAlphTx, refuseAlphTx } = walletConnectStore

  const onCancel = () => {
    refuseAlphTx(walletAction)
  }
  const onClickAccept = async (action: any) => {
    acceptAlphTx(action, sessionRequestData, currentWalletStore)
  }

  return (
    <WalletConnectModal title={`Confirm a tx...`} visible={visible} onClose={onCancel}>
      <View style={{ display: "flex", flexDirection: "column" }}>
        {(sessionRequestData?.type === "deploy-contract" || sessionRequestData?.type === "call-contract") && (
          <View style={styles.infoWrapper}>
            <View style={styles.infoItem}>
              <Text>TxId:</Text>
              <Text>{sessionRequestData.unsignedTxData.txId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text>GasAmount:</Text>
              <Text>{sessionRequestData.unsignedTxData.gasAmount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text>GasPrice:</Text>
              <Text>{sessionRequestData.unsignedTxData.gasPrice}</Text>
            </View>
          </View>

        )}
        <View style={styles.buttonsWrapper}>
          <Button onPress={() => onClickAccept(walletAction)}>
            <Text>Accept</Text>
          </Button>
          <Button onPress={() => refuseAlphTx(walletAction)}>
            <Text>Refuse</Text>
          </Button>
        </View>

      </View>
    </WalletConnectModal>
  )
}

export default WalletConnectExecuteTxAction


const styles = StyleSheet.create({
  infoWrapper: {
    display: 'flex',
    gap: 12,
    flexDirection: 'column',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonsWrapper:
    {
      marginTop: 20,
      flexDirection: "row",
      display: "flex",
      justifyContent: 'center',
      gap: 12,
      alignItems: "center"
    },
})
