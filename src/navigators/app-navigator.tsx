/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React, { useEffect, useState } from "react"
import {
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
  Text,
  ImageStyle,
  Dimensions,
} from "react-native"
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigation,
} from "@react-navigation/native"
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from "@react-navigation/native-stack"
import {
  WelcomeScreen,
  ImportWalletScreen,
  CreateWalletScreen,
  DashboardScreen,
  SendScreen,
  StakeScreen,
  SettingsScreen,
  ChangePasswordScreen,
  AddCurrencyScreen,
} from "screens"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

import { color, spacing } from "theme"
import { WalletReadyScreen } from "../screens/wallet-ready/wallet-ready-screen"
import { CoinDetailsScreen } from "../screens/coin-details/coin-details-screen"
import { ChooseWalletScreen } from "screens"
import { getListOfWallets } from "utils/storage"
import { ReceiveScreen } from "screens/receive/receive-screen"
import { useStores } from "models"

import { StackNavigationProp } from "@react-navigation/stack"
import { AutoImage as Image } from "../components"
import { SesameSmallLogo } from "theme/elements"
import { icons } from "components/icon/icons"

import reloadIcon from "@assets/svg/reload.svg"
import userIcon from "@assets/svg/user.svg"
import walletConnectIcon from "@assets/svg/walletconnect.svg"
import plusIcon from "@assets/svg/plus.svg"
import { SvgXml } from "react-native-svg"

import StakingBalance, {
  StackingBalanceRouteParams,
} from "../screens/staking-balance/StakingBalance"
import { UnstakeScreen } from "screens/unstake/unstake-screen"

import { OverlayLoading } from "../components/overlay-loading/overlay-loading"
import { observer } from "mobx-react-lite"
import { AlphChooseAddressScreen } from "screens/alph-choose-address/alph-choose-address-screen"
import AlephiumAddressSelector from "components/alephium/alephium-address-selector.component"
import { WalletConnectScannerModal } from "components/wallet-connect-scanner/wallet-connect-scanner-modal"
import WalletConnectExecuteTxAction
  from "components/wallet-connect-scanner/components/wallet-connect-execute-tx-action/wallet-connect-execute-tx-action.component.tsx"
import { calcExpiry } from "@walletconnect/utils"
import { ApiRequestArguments, SignExecuteScriptTxParams } from "@alephium/web3"
import { client } from "../../packages/shared/src/api/client.ts"
import { ALPH } from "@alephium/token-list"
import { partition } from "lodash"
import { CallContractTxData } from "types/transactions.ts"
import { buildCallContractTransaction, getActiveWalletConnectSessions } from "api/transactions.ts"
import SignClient from "@walletconnect/sign-client"

const NAV_HEADER_CONTAINER: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: spacing[7],
  paddingBottom: spacing[2],
  paddingHorizontal: spacing[4],
  borderColor: color.palette.lineColor,
  borderStyle: "dashed",
  borderWidth: 1,
  marginHorizontal: -1,
  marginTop: -1,
  backgroundColor: color.palette.black,
  width: "100%",
}

const NAV_HEADER_BTN_CONTAINER: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}
const NAV_HEADER_TITLE_CONTAINER: TextStyle = {
  flexDirection: "row",
  alignItems: "center",
}
const LOGO_STYLE: ImageStyle = {
  width: 32,
  height: 32,
  marginRight: spacing[2],
}
const NAV_HEADER_BTN: ViewStyle = {
  padding: spacing[2],
}
const BTN_ICON: TextStyle = {
  color: color.palette.white,
  width: 24,
  height: 24,
}
const WALLET_CONNECT_ICON: TextStyle = {
  width: 24,
  height: 24,
}
const LOGO: TextStyle = {
  color: color.palette.white,
  fontFamily: "Open Sans",
  fontWeight: "700",
  paddingRight: spacing[1],
}
const BACK_ARROW_ICON: ImageStyle = {
  width: 16,
  height: 16,
}

const Logo = () => (
  <View style={NAV_HEADER_BTN_CONTAINER}>
    <Image source={SesameSmallLogo} style={LOGO_STYLE} />
    <View style={NAV_HEADER_TITLE_CONTAINER}>
      <Text style={LOGO}>SEZAME</Text>
      <Text style={{ color: color.palette.offWhite }}>WALLET</Text>
    </View>
  </View>
)
const BackArrow = ({ navigation }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    onPress={() => navigation.goBack()}>
    <Image source={icons.back} style={BACK_ARROW_ICON} />
  </TouchableOpacity>
)

const MODAL_CONTAINER: TextStyle = {
  flex: 1,
  backgroundColor: "white",
  borderRadius: 4,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

function SettingsBtn({ hideOpitonals = false }: { hideOpitonals: boolean }) {
  const { currentWalletStore, exchangeRates, setWalletConnectSscannerShown } =
    useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const route = navigationRef.current?.getCurrentRoute()

  return (
    <View style={[NAV_HEADER_BTN_CONTAINER]}>
      <TouchableOpacity
        key="btn_reload"
        style={NAV_HEADER_BTN}
        onPress={() => {
          currentWalletStore.refreshBalances()
          exchangeRates.refreshCurrencies()
        }}>
        <SvgXml style={BTN_ICON} xml={reloadIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        key="btn_scan_qr"
        style={NAV_HEADER_BTN}
        onPress={() => {
          setWalletConnectSscannerShown(true)
        }}>
        <SvgXml style={WALLET_CONNECT_ICON} xml={walletConnectIcon} />
      </TouchableOpacity>
      {!hideOpitonals && (
        <>
          <TouchableOpacity
            key="btn_plus"
            style={NAV_HEADER_BTN}
            onPress={() => {
              navigation.navigate("addCurrency")
            }}>
            <SvgXml style={BTN_ICON} xml={plusIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            key="btn_settings"
            style={NAV_HEADER_BTN}
            onPress={() => {
              route.name === "settings"
                ? navigation.goBack()
                : navigation.navigate("settings")
            }}>
            <SvgXml style={BTN_ICON} xml={userIcon} />
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type NavigatorParamList = {
  welcome: undefined;
  home: undefined;
  importWallet: undefined;
  createWallet: undefined;
  chooseWallet: undefined;
  dashboard: undefined;
  walletReady: undefined;
  nfts: undefined;
  coinDetails: {
    fromAddCurrency?: boolean;
    coinId: string;
    chain?: string;
  };
  send: {
    coinId: string;
    chain: string;
  };
  stake: {
    chain: string;
    coinId: string;
  };
  unstake: {
    chain: string;
    coinId: string;
  };
  receive: {
    coinId: string;
  };
  settings: undefined;
  changePassword: undefined;
  alphChooseAddress: undefined;
  addCurrency: undefined;
  stakingBalance: StackingBalanceRouteParams;
};

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const { width } = Dimensions.get("screen")

const TestNetWarning = () => {
  const TESTNET_WRAPPER: ViewStyle = {
    height: 50,
    width: width,
    padding: 10,
    marginBottom: 5,
    justifyContent: "flex-end",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: color.palette.errorToast,
  }

  const TESTNET_MESSAGE: TextStyle = {
    color: color.palette.white,
    fontWeight: "bold",
  }
  return (
    <View style={TESTNET_WRAPPER}>
      <Text style={TESTNET_MESSAGE}>
        Warning, you are currently using testnet
      </Text>
    </View>
  )
}

const AppStackHeader = (
  props: NativeStackHeaderProps & { backArrow: boolean },
) => {
  const rootStore = useStores()
  let showButtons = true
  let displayAlphSelector =
    props.route.name === "coinDetails" &&
    props.route.params?.chain === "ALPH" &&
    props.route.params?.fromAddCurrency !== true
  if (props.route.name === "coinDetails") {
    showButtons = false
  }
  return (
    <View style={{ backgroundColor: color.palette.black }}>
      <View style={NAV_HEADER_CONTAINER}>
        {props.backArrow ? (
          <BackArrow navigation={props.navigation} />
        ) : (
          <Logo />
        )}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            justifyContent: "flex-end",
            flexGrow: 1,
          }}>
          {displayAlphSelector && <AlephiumAddressSelector />}
          <SettingsBtn hideOpitonals={!showButtons} />
        </View>
      </View>
      {rootStore?.TESTNET && <TestNetWarning />}
    </View>
  )
}

const AppStackHeaderWithBackArrow = props => {
  return <AppStackHeader {...props} backArrow />
}

const AppStack = () => {
  const [initialRouteName, setInitialRouteName] = useState<any>(null)
  const { exchangeRates } = useStores()
  useEffect(() => {
    getListOfWallets().then(walletNames => {
      if (walletNames.length) {
        setInitialRouteName("chooseWallet")
      } else {
        setInitialRouteName("welcome")
      }
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // Automatically refresh exchange rates every 2min
      exchangeRates.refreshCurrencies()
    }, 120000)

    return () => {
      clearInterval(interval)
    }
  }, [exchangeRates])

  return (
    <>
      {initialRouteName && (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={initialRouteName}>
          <Stack.Screen name="chooseWallet" component={ChooseWalletScreen} />
          <Stack.Screen name="welcome" component={WelcomeScreen} />
          <Stack.Screen name="importWallet" component={ImportWalletScreen} />
          <Stack.Screen name="createWallet" component={CreateWalletScreen} />
          {/* <Stack.Screen name="dashboard" component={DashboardScreen} /> */}
          <Stack.Screen
            name="dashboard"
            component={DashboardScreen}
            options={{
              title: null,
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
            }}
          />
          <Stack.Screen name="walletReady" component={WalletReadyScreen} />
          <Stack.Screen
            name="coinDetails"
            component={CoinDetailsScreen}
            options={{
              title: null,
              headerShown: true,
              header: AppStackHeaderWithBackArrow,
              headerStyle: { backgroundColor: color.palette.black },
            }}
          />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
            name="send"
            component={SendScreen}
          />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: false,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
            name="alphChooseAddress"
            component={AlphChooseAddressScreen}
          />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
            name="stake"
            component={StakeScreen}
          />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
            name="unstake"
            component={UnstakeScreen}
          />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: true,
              title: "",
            }}
            name="receive"
            component={ReceiveScreen}
          />
          <Stack.Screen
            name="settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
          />
          <Stack.Screen
            name="changePassword"
            component={ChangePasswordScreen}
            options={{
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
          />
          <Stack.Screen
            name="addCurrency"
            component={AddCurrencyScreen}
            options={{
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
          />

          <Stack.Screen
            name="stakingBalance"
            component={StakingBalance}
            options={{
              headerShown: true,
              header: AppStackHeader,
              headerStyle: { backgroundColor: color.palette.black },
              title: "",
            }}
          />
          {/** 🔥 Your screens go here */}
        </Stack.Navigator>
      )}
    </>
  )
}

interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {
}

export const AppNavigator = observer((props: NavigationProps) => {
  const colorScheme = useColorScheme()
  const { overlayLoadingShown, walletConnectSscannerShown, walletConnectStore, currentWalletStore } = useStores()
  const [sessionRequestData, setSessionRequestData] = useState<any>(null)

  const {
    client: walletClient,
    init: initWalletConnect,
    nextActions,
    requireExplorerApi,
    requireNodeApi,
    toggleTxModal,
    openTxModal,
  } = walletConnectStore

  const {
    getAssets
  }  = currentWalletStore

  //
  console.log(getAssets().then((res) => {
    console.log(res.toJSON(), 'res')
  }), 'log')

  const nextAction = nextActions.toJSON()[nextActions.toJSON().length - 1]
  console.log(nextAction, 'nextAction')
  const currentWallet = currentWalletStore.wallet;
  function hexToUtf8(hex: string) {
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  useEffect(() => {
    if (walletClient && currentWallet) {
      (new Promise<void>(async (resolve, reject) => {
        // for (const pairing of walletClient.core.pairing.getPairings()) {
        //   await walletClient.disconnect({ topic: pairing.topic, reason: getSdkError("USER_DISCONNECTED") })
        // }
        const firstPairing = walletClient.core.pairing.getPairings().reverse()[0]
        // await initWalletConnect()
        // await connect("", firstPairing.topic)
        resolve()
      }))
        .then(async res => {
          const activeSessions = getActiveWalletConnectSessions(walletClient)

          switch (nextAction?.action) {
            case "alph_signAndSubmitExecuteScriptTx": {
              const requestEvent = nextAction.eventData
              const {
                tokens,
                bytecode,
                gasAmount,
                gasPrice,
                signerAddress,
                attoAlphAmount,
              } = requestEvent.params.request.params as SignExecuteScriptTxParams

              let assetAmounts: any[] = []
              let allAlphAssets: any[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

              // const fromAddress = addressIds.find((address) => address === signerAddress)
              const fromAddress = signerAddress

              if (!fromAddress) {
                console.log("404")
                // return respondToWalletConnectWithError(requestEvent, {
                //   message: "Signer address doesn't exist",
                //   code: 404
                // })
              }
              if (tokens) {
                const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
                const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)
                assetAmounts = tokenAssets
                allAlphAssets = [...allAlphAssets, ...alphAssets]
              }

              if (allAlphAssets.length > 0) {
                assetAmounts.push({
                  id: ALPH.id,
                  amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0)),
                })
              }

              const wcTxData: CallContractTxData = {
                fromAddress,
                bytecode,
                assetAmounts,
                gasAmount,
                gasPrice: gasPrice?.toString(),
              }

              try {
                console.log("✅ BUILDING TX!")
                buildCallContractTransaction(wcTxData, currentWalletStore).then((buildCallContractTxResult) => {
                  const sessionRequestData = {
                    type: "call-contract",
                    wcData: wcTxData,
                    unsignedTxData: buildCallContractTxResult,
                  }
                  console.log("✅ BUILDING TX: DONE!", sessionRequestData)
                  setSessionRequestData(sessionRequestData)
                  toggleTxModal(true)
                }).catch((err) => {
                  console.log("❌ BUILDING TX! ERROR", err)
                })

              } catch (e) {
                console.log("❌ BUILDING TX! E", e)
              }
              break
            }
            case "eth_sendTransaction": {
              console.log(nextAction,"👉 WALLET CONNECT ASKED FOR THE eth_sendTransaction")
              console.log(nextAction.eventData, 'nextAction.eventData')
              const sessionRequestData = {
                type: "eth_sendTransaction",
              }
              setSessionRequestData(sessionRequestData)

              try {
                if(walletClient instanceof SignClient) {
                  const result = await walletClient.request({
                    topic: nextAction.eventData.topic,
                    chainId: 'eip155:1',
                    request: {
                      method: 'eth_sendTransaction',
                      params: nextAction.eventData.params.request.params
                    }
                  })
                  toggleTxModal(true)
                }
              } catch (e) {
                console.log("❌ eth_sendTransaction ERROR", e)
              }
              return;
            }
            case "alph_requestExplorerApi": {
              console.log(nextAction,"👉 WALLET CONNECT ASKED FOR THE EXPLORER API")
              walletClient.core.expirer.set(nextAction?.eventData.id, calcExpiry(5))
              const p = nextAction?.eventData.params.request.params as ApiRequestArguments
              client.explorer.request(p).then((res: any) => {
                requireExplorerApi(nextAction, res)
              }).catch((err: any) => {
                console.log("❌ alph_requestExplorerApi ERROR", err)
              })
              return;
            }
            case "signMessage": {
              // const { topic, params, id } = nextAction.eventData
              // const { request } = params
              // const requestParamsMessage = request.params[0]
              // const message = hexToUtf8(requestParamsMessage)
              // walletClient.signMessage(message).then((signedMessage) => {
              //   const response = { id, result: signedMessage, jsonrpc: '2.0' }
              //
              //   walletClient.respondSessionRequest({ topic, response }).then((res) => {
              //     console.log(res, 'resss')
              //   }).catch((err) => {
              //     console.log(err, 'errr')
              //   })
              //
              // }).catch((err) => {
              //   console.log(err, 'err')
              // })

              break;
            }

            case "alph_requestNodeApi": {
              console.log(nextAction,"👉 WALLET CONNECT ASKED FOR THE NODE API")
              walletClient.core.expirer.set(nextAction?.eventData.id, calcExpiry(5))
              const p = nextAction?.eventData.params.request.params as ApiRequestArguments
              client.node.request(p).then((res: any) => {
                requireNodeApi(nextAction, res)
              }).catch((err: any) => {
                console.log("❌ alph_requestNodeApi ERROR", err)
              })
              return;
            }
          }
        })
    }
  }, [walletClient, nextAction, currentWallet])


  useBackButtonHandler(canExit)
  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        {...props}>
        <AppStack />
      </NavigationContainer>
      <OverlayLoading visible={overlayLoadingShown} />
      <WalletConnectScannerModal visible={walletConnectSscannerShown} />
      <WalletConnectExecuteTxAction sessionRequestData={sessionRequestData} visible={openTxModal}
                                    walletAction={nextAction} />
    </>
  )
})

AppNavigator.displayName = "AppNavigator"

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["welcome"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
