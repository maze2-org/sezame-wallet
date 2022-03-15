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
  Button,
  StyleSheet,
  Text,
  ImageStyle,
} from "react-native"
import Modal from "react-native-modal"
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigation,
} from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
  WelcomeScreen,
  ImportWalletScreen,
  CreateWalletScreen,
  DashboardScreen,
  SendScreen,
  SettingsScreen,
} from "../screens"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
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
import { StoredWallet } from "../utils/stored-wallet"
import { StackNavigationProp } from "@react-navigation/stack"
import { AutoImage as Image } from "../components"
import {
  LogoStyle,
  SesameSmallLogo,
  tabBarButton,
  tabBarFocused,
  tabBarItemBorderRightStyle,
  tabBarItemStyle,
  tabBarStyle,
} from "theme/elements"

import QRCodeIcon from "../../assets/svg/qr_code.svg"
import UserIcon from "../../assets/svg/user.svg"
import PlusIcon from "../../assets/svg/plus.svg"
import { SvgXml } from "react-native-svg"

import tabWallet from "../../assets/svg/tab-wallet.svg"
import tabNft from "../../assets/svg/tab-nft.svg"

const NAV_HEADER_BTN_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing[6],
  marginBottom: spacing[2],
}
const NAV_HEADER_TITLE_CONTAINER: TextStyle = {
  display: "flex",
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

const Logo = () => (
  <View style={NAV_HEADER_BTN_CONTAINER}>
    {/* <TouchableOpacity style={NAV_HEADER_BTN}>
      <FontAwesome5Icon style={BTN_ICON} name="qrcode" size={23} />
    </TouchableOpacity>
    <View style={NAV_HEADER_BTN_CONTAINER}>
      <Text style={{ color: color.palette.black }}>SESAME</Text>
      <Text style={{ color: color.palette.offWhite }}>WALLET</Text>
    </View> */}
    <Image source={SesameSmallLogo} style={LOGO_STYLE} />
    <View style={NAV_HEADER_TITLE_CONTAINER}>
      <Text
        style={{
          color: color.palette.white,
          fontFamily: "Open Sans",
          fontWeight: "700",
          paddingRight: spacing[1],
        }}
      >
        SESAME
      </Text>
      <Text style={{ color: color.palette.offWhite }}>WALLET</Text>
    </View>
  </View>
)

const MODAL_CONTAINER: TextStyle = {
  flex: 1,
  backgroundColor: "white",
  borderRadius: 4,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

// Just some styles
const styles = StyleSheet.create({
  item: {
    // backgroundColor: '#f9c2ff',
    padding: 24,
  },
  title: {
    fontSize: 32,
  },
})

const SettingsBtn = ({ route }) => {
  const COMMON = {
    privateKey: "",
    publicKey: "",
    balance: 0,
    value: 0,
    rate: 0,
    version: 1,
  }
  const NETWORKS = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      cid: "bitcoin",
      chain: "BTC",
      type: "coin",
      decimals: 8,
      address: "bc1qx6juea389gv4g3qzz0vwmzjjjhxwtdvzmk2e6c",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      ...COMMON,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      cid: "ethereum",
      chain: "ETH",
      type: "coin",
      decimals: 18,
      address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      ...COMMON,
    },
    {
      symbol: "AVN",
      name: "AVNRich",
      cid: "avnrich",
      chain: "BSC",
      type: "coin",
      decimals: 18,
      address: "0xbf151f63d8d1287db5fc7a3bc104a9c38124cdeb",
      image: "https://assets.coingecko.com/coins/images/14819/large/avn.png",
    },
    {
      symbol: "ALPH",
      name: "Alephium",
      cid: "alephium",
      chain: "ALPH",
      type: "coin",
      decimals: 18,
      address: "0x79f01edb3ceace570587a05f5296c34fb7f400f3",
      image:
        "https://assets.coingecko.com/coins/images/21598/large/Alephium-Logo_200x200_listing.png",
    },
  ]
  const [isOpenAddAssetModal, setIsOpenAddAssetModal] = useState<boolean>(false)
  const { currentWalletStore } = useStores()
  const [storedWallet, setStoredWallet] = useState<any>(null)
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  console.log("got route ", route)
  useEffect(() => {
    const { walletName, mnemonic, password } = JSON.parse(currentWalletStore.wallet)
    setStoredWallet(new StoredWallet(walletName, mnemonic, password))
  }, [])

  const addAssets = async (network: any) => {
    await storedWallet.addAutoAsset(network)
    await storedWallet.save()
    currentWalletStore.open(storedWallet)
  }

  const closeModal = () => {
    setIsOpenAddAssetModal(false)
  }

  return (
    <View style={NAV_HEADER_BTN_CONTAINER}>
      <TouchableOpacity
        style={NAV_HEADER_BTN}
        onPress={() => {
          console.log("a")
        }}
      >
        <SvgXml style={BTN_ICON} xml={QRCodeIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={NAV_HEADER_BTN} onPress={() => setIsOpenAddAssetModal(true)}>
        <SvgXml style={BTN_ICON} xml={PlusIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={NAV_HEADER_BTN}
        onPress={() => {
          route === "settings" ? navigation.goBack() : navigation.navigate("settings")
        }}
      >
        <SvgXml style={BTN_ICON} xml={UserIcon} />
      </TouchableOpacity>

      <Modal isVisible={isOpenAddAssetModal}>
        <View style={MODAL_CONTAINER}>
          {NETWORKS.map((network) => (
            <TouchableOpacity
              onPress={() => {
                addAssets(network)
                closeModal()
              }}
              key={network.cid}
            >
              <View style={styles.item}>
                <Text style={styles.title}>{network.symbol}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <Button title="Cancel" onPress={closeModal} />
        </View>
      </Modal>
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
    coinId: string
  }
  send: {
    coinId: string
  }
  receive: {
    coinId: string
  }
  settings: undefined
  // 🔥 Your screens go here
}

const Tab = createBottomTabNavigator()
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: tabBarStyle,
        headerShown: false,
        tabBarActiveTintColor: color.palette.white,
        // eslint-disable-next-line react/display-name
        tabBarIcon: ({ focused }) => {
          return (
            <View style={[tabBarButton, focused && { ...tabBarFocused }]}>
              {route.name === "home" && (
                <SvgXml
                  stroke={focused ? color.palette.gold : color.palette.lighterGrey}
                  xml={tabWallet}
                  height={20}
                />
              )}
              {route.name === "nfts" && (
                <SvgXml
                  stroke={focused ? color.palette.gold : color.palette.lightGrey}
                  xml={tabNft}
                  height={20}
                />
              )}
            </View>
          )
          // if (route.name === "home") {
          //   return <FontAwesome5Icon name="wallet" size={23} color={color} />
          // } else if (route.name === "nfts") {
          //   return <FontAwesomeIcon name="file-picture-o" size={size} color={color} />
          // }
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={DashboardScreen}
        options={{
          tabBarLabel: "WALLET",
          tabBarStyle: [tabBarItemStyle, tabBarItemBorderRightStyle],
          tabBarActiveTintColor: color.palette.white,
        }}
      />
      <Tab.Screen
        name="nfts"
        component={NftsScreen}
        options={{ tabBarLabel: "NFT", tabBarStyle: tabBarItemStyle }}
      />
    </Tab.Navigator>
  )
}
// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const AppStack = () => {
  const [initialRouteName, setInitialRouteName] = useState<any>(null)
  useEffect(() => {
    getListOfWallets().then((walletNames) => {
      if (walletNames.length) {
        setInitialRouteName("chooseWallet")
      } else {
        setInitialRouteName("welcome")
      }
    })
  }, [])
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
          {/*<Stack.Screen*/}
          {/*  name="home"*/}
          {/*  component={BottomTabNavigator}*/}
          {/*  options={{ headerShown: true, headerRight: SettingsBtn }}*/}
          {/*/>*/}
          <Stack.Screen name="importWallet" component={ImportWalletScreen} />
          <Stack.Screen name="createWallet" component={CreateWalletScreen} />

          <Stack.Screen
            name="dashboard"
            component={BottomTabNavigator}
            options={{
              headerShown: true,
              headerRight: () => <SettingsBtn route="dashboard" />,
              headerLeft: Logo,
              headerBackVisible: false,
              headerStyle: {
                backgroundColor: "transparent",
              },
              title: "",
            }}
          />
          <Stack.Screen name="walletReady" component={WalletReadyScreen} />
          <Stack.Screen name="coinDetails" component={CoinDetailsScreen} />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: true,
              headerRight: () => <SettingsBtn route="settings" />,
              headerStyle: { backgroundColor: color.palette.black },
              headerLeft: Logo,
              title: "",
            }}
            name="send"
            component={SendScreen}
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
              headerRight: () => <SettingsBtn route="settings" />,
              headerStyle: { backgroundColor: color.palette.black },
              headerLeft: Logo,
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

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  useBackButtonHandler(canExit)
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
}

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
