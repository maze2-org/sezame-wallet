import React, { createRef, FC, useEffect, useState } from "react"
import {
  View,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import ActionSheet from "react-native-actions-sheet"
import * as Animatable from "react-native-animatable"
import { Camera } from 'react-native-vision-camera';
import { observer } from "mobx-react-lite"
import { useStores } from "models"
import { showMessage } from "react-native-flash-message"
import { useNavigation } from "@react-navigation/native"
import { WalletFactory } from "@maze2/sezame-sdk"
import { useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"

import { color, spacing } from "../../theme"
import { NavigatorParamList } from "../../navigators"
import { AppScreen, Button, Footer, Screen, Text } from "../../components"
import { chainSymbolsToNames, CHAIN_ID_TYPE_MAP } from "utils/consts"
import { walletConnectService, WALLET_CONNECT_STATUS } from "services/walletconnect"

const ROOT: ViewStyle = {
  padding: spacing[4],
}
const cameracontainer: ViewStyle = {
  height: Dimensions.get("window").height / 1.1,
  margin: 10,
  backgroundColor: "black",
}
const CONNECT_BTNS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
}
const AUTH_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "column",
}
const ACCEPT_BTN: ViewStyle = {
  margin: spacing[2],
  width: 120,
}
const REJECT_BTN: ViewStyle = {
  margin: spacing[2],
  backgroundColor: color.palette.darkBlack,
  width: 120,
}
const ACCEPT_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontWeight: "bold",
}
const REJECT_BTN_TEXT: TextStyle = {
  ...ACCEPT_BTN_TEXT,
}
const WC_LOGO_CONTAINER: ViewStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginVertical: spacing[4],
}
const WC_LOGO: ImageStyle = {
  width: 80,
  height: 80,
}
const DO_YOU_ACCEPT_TEXT: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: spacing[2],
}
const DISCONNECT_BTN: ViewStyle = {
  backgroundColor: color.error,
}
const NETWORK_DETAILS: ViewStyle = {
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  marginVertical: spacing[2],
}
const TRANSACTION_DETAILS: ViewStyle = {}
const TRANSACTION_DETAILS_TEXT: TextStyle = {
  textAlign: "center",
}
const PEER_NAME: TextStyle = {
  textAlign: "center",
  fontWeight: "bold",
}

const actionCamera: React.RefObject<any> = createRef()

export const WalletConnectScreen: FC<
  StackScreenProps<NavigatorParamList, "walletConnect">
> = observer(function WalletConnectScreen({ route }) {
  const { walletConnectStore, currentWalletStore } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const devices = useCameraDevices();
  const device = { ...devices.back };

  const [success, setSuccess] = useState(false)
  const [hasPermission, setHasPermission] = React.useState(false);
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  const handleCloseActionSheet = () => {
    if (!success) {
      navigation.goBack()
    }
  }

  useEffect((): any => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();

    if (route.params && route.params.uri) {
      const uri = route.params.uri
      const data: any = { uri }
      data.redirect = ""
      data.autosign = false
      if (!walletConnectService.init(walletConnectStore, data)) {
        // Display error message
        showMessage({
          message: "Something went wrong",
          type: "warning",
        })
      }
    } else {
      actionCamera.current?.setModalVisible()
    }

    return walletConnectService.closeSession
  }, [])

  const onSuccess = (uri) => {
    setSuccess(true)
    const data: any = { uri }
    data.redirect = ""
    data.autosign = false
    const intiResult = walletConnectService.init(walletConnectStore, data)

    if (!intiResult) {
      // Display error message
      showMessage({
        message: "Something went wrong",
        type: "warning",
      })
    }
    actionCamera.current?.setModalVisible(false)
  }

  const connectingRender = () => {
    return (
      <View>
        <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
          <View style={WC_LOGO_CONTAINER}>
            <Image style={WC_LOGO} source={require("../../assets/wc.png")} resizeMode="contain" />
          </View>
        </Animatable.View>
        <View>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      </View>
    )
  }

  const transactionDetails = () => {
    return (
      <View style={TRANSACTION_DETAILS}>
        <Text style={TRANSACTION_DETAILS_TEXT} numberOfLines={3}>
          {walletConnectStore.peerMeta.description}
        </Text>
        <Text style={TRANSACTION_DETAILS_TEXT} numberOfLines={3}>
          {walletConnectStore.peerMeta.url}
        </Text>
      </View>
    )
  }

  const renderPeerMeta = () => {
    if (walletConnectStore.status === WALLET_CONNECT_STATUS.CONNECTING) {
      return connectingRender()
    }

    if (!walletConnectStore.peerMeta) {
      return null
    }
    return (
      <View>
        {!!walletConnectStore.peerMeta.name && (
          <View style={NETWORK_DETAILS}>
            {walletConnectStore.status !== WALLET_CONNECT_STATUS.SESSION_REQUEST ? (
              <View>
                <Text style={DO_YOU_ACCEPT_TEXT}>
                  {"Wallet connected"}
                  {" - Network: "}
                  {chainSymbolsToNames[walletConnectStore.chainId]}
                </Text>
              </View>
            ) : null}
            <Text style={PEER_NAME} numberOfLines={2}>
              {walletConnectStore.peerMeta.name}
            </Text>
            <Image
              style={WC_LOGO}
              source={{
                uri: walletConnectStore.peerMeta.icons[0],
              }}
              resizeMode="contain"
            />
            {transactionDetails()}
          </View>
        )}
        {renderActionRequest()}
        {renderAuthRequest()}
      </View>
    )
  }

  const acceptRequest = async (method: any) => {
    try {
      const chainType = CHAIN_ID_TYPE_MAP[walletConnectStore.chainId]
      const asset = currentWalletStore.getAssetByChain(chainType)

      const cryptoWallet = WalletFactory.getWallet(
        Object.assign({}, asset, {
          pubKey: asset.publicKey,
          privKey: asset.privateKey,
          walletAddress: asset.address,
          contract: null,
        }),
      )

      if (!cryptoWallet) {
        walletConnectService.rejectRequest({
          id: walletConnectStore.transactionData.id!,
          error: "Chain is not supported",
        })
      }
      const signingManager = cryptoWallet.getSigningManager()
      if (!signingManager) {
        walletConnectService.rejectRequest({
          id: walletConnectStore.transactionData.id!,
          error: "Something went wrong",
        })
        return
      }

      let result: any = ""
      if (method === WALLET_CONNECT_STATUS.SIGN_TRANSACTION) {
        const params = walletConnectStore.transactionData.params[0]!
        const tx = await signingManager.signTransaction(params)
        result = tx
      }
      if (method === WALLET_CONNECT_STATUS.SEND_TRANSACTION) {
        const params = walletConnectStore.transactionData.params[0]!
        const tx = await signingManager.signTransaction(params)
        result = await cryptoWallet.postRawTxSend(tx)
      }
      if (method === WALLET_CONNECT_STATUS.SIGN_TYPED_DATA) {
        const params = JSON.parse(walletConnectStore.transactionData.params[1]!)
        result = await signingManager.signTypedData(params)
      }
      walletConnectService.approveRequest({
        id: walletConnectStore.transactionData.id!,
        result: result,
      })
    } catch (e: any) {
      console.error(e)
      walletConnectService.rejectRequest({
        id: walletConnectStore.transactionData.id!,
        error: e?.message,
      })
    }
  }

  const renderActionRequest = () => {
    if (
      walletConnectStore.status === WALLET_CONNECT_STATUS.SEND_TRANSACTION ||
      walletConnectStore.status === WALLET_CONNECT_STATUS.SIGN_TRANSACTION ||
      walletConnectStore.status === WALLET_CONNECT_STATUS.SIGN_TYPED_DATA
    ) {
      return (
        <Animatable.View animation="bounceIn" style={CONNECT_BTNS_CONTAINER}>
          <Button style={ACCEPT_BTN} onPress={async () => acceptRequest(walletConnectStore.status)}>
            <Text style={ACCEPT_BTN_TEXT}>Approve</Text>
          </Button>
          <Button
            style={REJECT_BTN}
            text={"Reject"}
            onPress={() =>
              walletConnectService.rejectRequest({
                id: walletConnectStore.transactionData.id!,
                error: "",
              })
            }
          >
            <Text style={REJECT_BTN_TEXT}>Reject</Text>
          </Button>
        </Animatable.View>
      )
    }
    return null
  }

  const renderAuthRequest = () => {
    if (walletConnectStore.status !== WALLET_CONNECT_STATUS.SESSION_REQUEST) {
      return null
    }

    const chainType = CHAIN_ID_TYPE_MAP[walletConnectStore.chainId]
    if (!chainType) {
      walletConnectService.rejectSession()
      showMessage({
        message: "Wrong chain",
        type: "warning",
      })
      // return
    }

    const acceptSession = () => {
      if (!currentWalletStore.getWalletAddressByChain(chainType)) {
        showMessage({
          message: "Wallet not found",
          type: "warning",
        })
        return
      }
      // Get the coresponding wallet for the chain
      walletConnectService.acceptSession(
        walletConnectStore.chainId,
        currentWalletStore.getWalletAddressByChain(chainType),
      )
    }

    return (
      <Animatable.View animation="bounceIn" style={AUTH_CONTAINER}>
        <View>
          <Text style={DO_YOU_ACCEPT_TEXT}>{"Do you accept the connection?"}</Text>
        </View>
        <View style={CONNECT_BTNS_CONTAINER}>
          <Button style={ACCEPT_BTN} onPress={acceptSession}>
            <Text style={ACCEPT_BTN_TEXT}>{"Accept"}</Text>
          </Button>
          <Button style={REJECT_BTN} onPress={() => walletConnectService.rejectSession()}>
            <Text style={REJECT_BTN_TEXT}>{"Reject"}</Text>
          </Button>
        </View>
      </Animatable.View>
    )
  }

  const renderDisconnect = () => {
    if (walletConnectStore.status !== WALLET_CONNECT_STATUS.CONNECTED) {
      return null
    }
    const disconnect = () => {
      walletConnectService.closeSession()
      navigation.goBack()
    }
    return (
      <View>
        <Button style={DISCONNECT_BTN} onPress={disconnect}>
          <Text style={REJECT_BTN_TEXT}>{"Disconnect"}</Text>
        </Button>
      </View>
    )
  }

  useEffect(()=>{
    if(barcodes?.length && !success){
      onSuccess(barcodes[0].displayValue)
    }
  },[barcodes])

  return (
    <AppScreen>
      <ScrollView style={ROOT}>
        {renderPeerMeta()}
        {renderDisconnect()}
      </ScrollView>
      <ActionSheet
        ref={actionCamera}
        gestureEnabled={true}
        headerAlwaysVisible
        containerStyle={cameracontainer}
        onClose={handleCloseActionSheet}
      >
        {
            !success &&
            !!device &&
            !!hasPermission && (
              <Camera
                style={{width: '100%', height: '100%'}}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                frameProcessorFps={1}
              />
            )
        }
      </ActionSheet>
      <Footer onLeftButtonPress={() => navigation.goBack()}> </Footer>
    </AppScreen>
  )
})
