import React, { PropsWithChildren } from "react"
import FlashMessage from "react-native-flash-message"
import { Modal, TouchableOpacity, View } from "react-native"

import { Text } from "components"
import { color } from "theme"
import walletConnectStyles from "../../wallet-connect-scanner.styles"

type WalletConnectModalProps = PropsWithChildren & {
  title: string;
  visible?: boolean;
  onClose: () => any;
  flashMessageRef?: React.MutableRefObject<FlashMessage | undefined>;
};

function WalletConnectModal({
                              visible,
                              title,
                              children,
                              onClose,
                              flashMessageRef,
                            }: WalletConnectModalProps) {
  return (
    <Modal transparent animationType={"fade"} visible={visible}>
      <TouchableOpacity
        style={walletConnectStyles.WALLETCONNECT_CONTAINER}
        onPress={() => {
          onClose && onClose()
        }}>
        <View style={walletConnectStyles.WALLETCONNECT_CONTAINER_INNER}>
          <TouchableOpacity
            activeOpacity={1}
            style={walletConnectStyles.WALLETCONNECT_BOX}>
            <Text style={{ fontSize: 18, color: color.palette.white, marginBottom: 16 }}>
              {title}
            </Text>
            {children}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {flashMessageRef && (
        <FlashMessage ref={flashMessageRef as any} position="bottom" />
      )}
    </Modal>
  )
}

export default WalletConnectModal
