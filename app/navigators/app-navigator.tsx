/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React, {
  useEffect,
  useRef,
  useState,
} from "react"
import {
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
  StyleSheet,
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
import { createNativeStackNavigator, NativeStackHeaderProps } from "@react-navigation/native-stack"
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
} from "../screens"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
// import Icon from "react-native-vector-icons/Ionicons"

import { color, spacing } from "../theme"
import { WalletReadyScreen } from "../screens/wallet-ready/wallet-ready-screen"
import { NftsScreen } from "../screens/nfts/nfts-screen"
import { CoinDetailsScreen } from "../screens/coin-details/coin-details-screen"
import { ChooseWalletScreen } from "../screens/choose-wallet/choose-wallet-screen"
import { getListOfWallets } from "../utils/storage"
import { ReceiveScreen } from "screens/receive/receive-screen"
import { useStores } from "../models"

import { StackNavigationProp } from "@react-navigation/stack"
import { AutoImage as Image } from "../components"
import {
  SesameSmallLogo,
  tabBarItem,
  tabBarItemBorderRightStyle,
  tabBarItemFocused,
  tabBarItemStyle,
  tabBarLabel,
  tabBarLabelFocused,
  tabBarStyle,
} from "theme/elements"
import { icons } from "../components/icon/icons/index"

import ReloadIcon from "../../assets/svg/reload.svg"
import QRCodeIcon from "../../assets/svg/qr_code.svg"
import UserIcon from "../../assets/svg/user.svg"
import PlusIcon from "../../assets/svg/plus.svg"
import { SvgXml } from "react-native-svg"
import TabNft from "../components/svg/TabNft"
import Ready from "../components/svg/Ready"

import { WalletConnectScreen } from "screens/wallet-connect/wallet-connect-screen"
import StakingBalance, {
  StackingBalanceProps,
  StackingBalanceRouteParams,
} from "../screens/staking-balance/StakingBalance"
import { UnstakeScreen } from "screens/unstake/unstake-screen"

import { OverlayLoading } from "../components/overlay-loading/overlay-loading"
import { observer } from "mobx-react-lite"
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
    onPress={() => navigation.goBack()}
  >
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

function SettingsBtn() {
  const { currentWalletStore, exchangeRates } = useStores()
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const route = navigationRef.current?.getCurrentRoute()

  return (
    <View style={NAV_HEADER_BTN_CONTAINER}>
      <TouchableOpacity
        key="btn_reload"
        style={NAV_HEADER_BTN}
        onPress={() => {
          currentWalletStore.refreshBalances()
          exchangeRates.refreshCurrencies()
        }}
      >
        <SvgXml style={BTN_ICON} xml={ReloadIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        key="btn_scan"
        style={NAV_HEADER_BTN}
        onPress={() => {
          currentWalletStore.stopLoading()
          navigation.navigate("walletConnect")
        }}
      >
        <SvgXml style={BTN_ICON} xml={QRCodeIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        key="btn_plus"
        style={NAV_HEADER_BTN}
        onPress={() => {
          navigation.navigate("addCurrency")
        }}
      >
        <SvgXml style={BTN_ICON} xml={PlusIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        key="btn_settings"
        style={NAV_HEADER_BTN}
        onPress={() => {
          route.name === "settings" ? navigation.goBack() : navigation.navigate("settings")
        }}
      >
        <SvgXml style={BTN_ICON} xml={UserIcon} />
      </TouchableOpacity>
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
  welcome: undefined
  home: undefined
  importWallet: undefined
  createWallet: undefined
  chooseWallet: undefined
  dashboard: undefined
  walletReady: undefined
  nfts: undefined
  coinDetails: {
    fromAddCurrency?: boolean
    coinId: string
    chain?: string
  }
  send: {
    coinId: string
  }
  stake: {
    chain: string
    coinId: string
  }
  unstake: {
    chain: string
    coinId: string
  }
  receive: {
    coinId: string
  }
  settings: undefined
  changePassword: undefined
  addCurrency: undefined
  stakingBalance: StackingBalanceRouteParams
  walletConnect: {
    uri: string
  }
  // 🔥 Your screens go here
}

const Tab = createBottomTabNavigator()
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: color.palette.white,
        // eslint-disable-next-line react/display-name
        tabBarIcon: ({ focused }) => {
          return (
            <View>
              {route.name === "home" && (
                <View
                  style={[
                    tabBarItem,
                    tabBarItemBorderRightStyle,
                    focused && { ...tabBarItemFocused },
                  ]}
                >
                  <Ready isActive={focused} />
                  <Text style={focused ? tabBarLabelFocused : tabBarLabel}>WALLET</Text>
                </View>
              )}
              {route.name === "nfts" && (
                <View style={[tabBarItem, focused && { ...tabBarItemFocused }]}>
                  <TabNft isActive={focused} />
                  <Text style={focused ? tabBarLabelFocused : tabBarLabel}>NFT</Text>
                </View>
              )}
            </View>
          )
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={DashboardScreen}
        options={{ tabBarShowLabel: false, tabBarStyle: tabBarItemStyle }}
      />
      <Tab.Screen
        name="nfts"
        component={NftsScreen}
        options={{ tabBarShowLabel: false, tabBarStyle: tabBarItemStyle }}
      />
    </Tab.Navigator>
  )
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const {width} = Dimensions.get("screen")

const TestNetWarning = () => {

  const TESTNET_WRAPPER:ViewStyle = {
    height:50,
    width:width,
    padding: 10,
    marginBottom:5,
    justifyContent:"flex-end",
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    backgroundColor:color.palette.errorToast,
  }

  const TESTNET_MESSAGE:TextStyle = {
    color:color.palette.white,
    fontWeight: "bold",
  }
  return(
    <View style={TESTNET_WRAPPER}>
      <Text style={TESTNET_MESSAGE}>Warning, you are currently using testnet</Text>
    </View>
  )
}

const AppStackHeader = (props: NativeStackHeaderProps & { backArrow: boolean }) => {
  const rootStore = useStores();

  return (
    <View style={{backgroundColor:color.palette.black}}>
      <View style={NAV_HEADER_CONTAINER}>
        {props.backArrow ? <BackArrow navigation={props.navigation} /> : <Logo />}
        <SettingsBtn />
      </View>
      {rootStore?.TESTNET &&
      <TestNetWarning />
      }
    </View>
  )
}

const AppStackHeaderWithBackArrow = (props) => {
  return <AppStackHeader {...props} backArrow />
}

const AppStack = () => {
  const [initialRouteName, setInitialRouteName] = useState<any>(null)
  const { exchangeRates } = useStores()
  useEffect(() => {
    getListOfWallets().then((walletNames) => {
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
          initialRouteName={initialRouteName}
        >
          <Stack.Screen name="chooseWallet" component={ChooseWalletScreen} />
          <Stack.Screen name="welcome" component={WelcomeScreen} />
          <Stack.Screen name="importWallet" component={ImportWalletScreen} />
          <Stack.Screen name="createWallet" component={CreateWalletScreen} />
          <Stack.Screen
            name="dashboard"
            component={BottomTabNavigator}
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
            name="walletConnect"
            component={WalletConnectScreen}
            options={{
              headerShown: true,
              headerRight: SettingsBtn,
              headerStyle: { backgroundColor: color.palette.black },
              headerLeft: Logo,
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

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer((props: NavigationProps) => {
  const colorScheme = useColorScheme()
  const { overlayLoadingShown } = useStores();

  useBackButtonHandler(canExit)
  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        {...props}
      >
        <AppStack />
      </NavigationContainer>
      <OverlayLoading visible={overlayLoadingShown} />
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
