import React, { createRef, FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  TouchableOpacity,
  View,
  ViewStyle,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  BackHandler,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import * as Animatable from "react-native-animatable"
import ActionSheet from "react-native-actions-sheet"
import QRCodeScanner from "react-native-qrcode-scanner"
import { RNCamera } from "react-native-camera"

import { NavigatorParamList } from "../../navigators"
import { AppScreen, Button, Footer, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { SEPARATOR } from "theme/elements"
import { walletConnectService, WALLET_CONNECT_STATUS } from "services/walletconnect"
import { useStores } from "models"
import { chainSymbolsToNames, CHAIN_ID_TYPE_MAP } from "utils/consts"
import { useNavigation } from "@react-navigation/native"
import { WalletFactory } from "@maze2/sezame-sdk"
import { showMessage } from "react-native-flash-message"
const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`
}
const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const cameracontainer: ViewStyle = {
  height: Dimensions.get("window").height / 1.1,
  margin: 10,
  backgroundColor: "black",
}
const actionCamera: React.RefObject<any> = createRef()

export const WalletConnectScreen: FC<
  StackScreenProps<NavigatorParamList, "walletConnect">
> = observer(function WalletConnectScreen({ route }) {
  const { walletConnectStore, currentWalletStore } = useStores()
  const [success, setSuccess] = useState(false)
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const handleCloseActionSheet = () => {
    if (!success) {
      navigation.goBack()
    }
  }

  useEffect((): any => {
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

  const onSuccess = (e) => {
    console.log("success ", e)
    setSuccess(true)
    const uri = e.data
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

  const disconnectedRender = () => {
    return (
      <View>
        {/* <Animatable.View animation="zoomIn" delay={100}>
          <View>
            <Image source={require("../../assets/wc.png")} resizeMode="contain" />
          </View>
        </Animatable.View> */}
        {/* <View>
          <Text>
            Check the URL carefully, please make sure you're visiting the intended website!
          </Text>
          <Button text={"Scan QR Code"} onPress={() => actionCamera.current?.setModalVisible()} />
        </View> */}
      </View>
    )
  }

  const connectingRender = () => {
    return (
      <View>
        {/* <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
          <View>
            <Image source={require("../../assets/wc.png")} resizeMode="contain" />
          </View>
        </Animatable.View> */}
        <View>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      </View>
    )
  }

  const transactionDetails = () => {
    return (
      <View>
        <Text numberOfLines={3}>{walletConnectStore.peerMeta.description}</Text>
        <Text numberOfLines={3}>{walletConnectStore.peerMeta.url}</Text>
      </View>
    )
  }

  const renderPeerMeta = () => {
    if (walletConnectStore.status === WALLET_CONNECT_STATUS.CONNECTING) {
      return connectingRender()
    }
    if (walletConnectStore.status === WALLET_CONNECT_STATUS.DISCONNECTED) {
      return disconnectedRender()
    }
    if (!walletConnectStore.peerMeta) {
      return null
    }
    return (
      <View>
        <View>
          <Image
            source={{
              uri: walletConnectStore.peerMeta.icons[0],
            }}
            resizeMode="contain"
          />
          {walletConnectStore.status !== WALLET_CONNECT_STATUS.SESSION_REQUEST ? (
            <View>
              <Text>
                {"Wallet connected"}
                {" - Network: "}
                {chainSymbolsToNames[walletConnectStore.chainId]}
              </Text>
            </View>
          ) : null}
          <Text numberOfLines={2}>{walletConnectStore.peerMeta.name}</Text>
          {transactionDetails()}
        </View>
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
        <Animatable.View animation="bounceIn">
          <Button text={"Approve"} onPress={async () => acceptRequest(walletConnectStore.status)} />
          <Button
            text={"Reject"}
            onPress={() =>
              walletConnectService.rejectRequest({
                id: walletConnectStore.transactionData.id!,
                error: "",
              })
            }
          />
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
      return
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
      <Animatable.View animation="bounceIn">
        <Text>{"Trying to connect"}</Text>
        <Button text={"Accept"} onPress={acceptSession} />
        <Button text={"Reject"} onPress={() => walletConnectService.rejectSession()} />
      </Animatable.View>
    )
  }

  const renderDisconnect = () => {
    if (walletConnectStore.status !== WALLET_CONNECT_STATUS.CONNECTED) {
      return null
    }
    return (
      <View>
        <Button text={"Disconnect"} onPress={() => walletConnectService.closeSession()} />
      </View>
    )
  }

  return (
    <AppScreen>
      <ScrollView>
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
        <QRCodeScanner onRead={onSuccess} flashMode={RNCamera.Constants.FlashMode.auto} />
      </ActionSheet>
      <Footer onLeftButtonPress={() => navigation.goBack()}> </Footer>
    </AppScreen>
  )
})
