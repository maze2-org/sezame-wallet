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
  useRoute,
} from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
  WelcomeScreen,
  ImportWalletScreen,
  CreateWalletScreen,
  DashboardScreen,
  SendScreen,
  SettingsScreen,
  ChangePasswordScreen,
  AddCurrencyScreen,
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
import { AutoImage as Image, CurrenciesSelector, Drawer } from "../components"
import {
  SesameSmallLogo,
  tabBarButton,
  tabBarItem,
  tabBarItemBorderRightStyle,
  tabBarItemFocused,
  tabBarItemStyle,
  tabBarLabel,
  tabBarLabelFocused,
  tabBarStyle,
} from "theme/elements"

import QRCodeIcon from "../../assets/svg/qr_code.svg"
import UserIcon from "../../assets/svg/user.svg"
import PlusIcon from "../../assets/svg/plus.svg"
import { SvgXml } from "react-native-svg"

import tabWallet from "../../assets/svg/tab-wallet.svg"
import ready from "../../assets/svg/ready.svg"
import tabNft from "../../assets/svg/tab-nft.svg"

const NAV_HEADER_CONTAINER: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
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
      <Text style={LOGO}>SESAME</Text>
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
    padding: 24,
  },
  title: {
    fontSize: 32,
  },
})

function SettingsBtn() {
  const { currentWalletStore } = useStores()
  const [storedWallet, setStoredWallet] = useState<any>(null)
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
  const route = navigationRef.current?.getCurrentRoute()

  useEffect(() => {
    const { walletName, mnemonic, password } = JSON.parse(currentWalletStore.wallet)
    setStoredWallet(new StoredWallet(walletName, mnemonic, password))
  }, [])

  // const addAssets = async (network: any) => {
  //   await storedWallet.addAutoAsset(network)
  //   await storedWallet.save()
  //   currentWalletStore.open(storedWallet)
  // }

  // const closeModal = () => {
  //   setIsOpenAddAssetModal(false)
  // }

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
      <TouchableOpacity
        style={NAV_HEADER_BTN}
        onPress={() => {
          navigation.navigate("addCurrency")
        }}
      >
        <SvgXml style={BTN_ICON} xml={PlusIcon} />
      </TouchableOpacity>
      <TouchableOpacity
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
    coinId: string
  }
  send: {
    coinId: string
  }
  receive: {
    coinId: string
  }
  settings: undefined
  changePassword: undefined
  addCurrency: undefined
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
            <View style={tabBarButton}>
              {route.name === "home" && (
                <View
                  style={[
                    tabBarItem,
                    tabBarItemBorderRightStyle,
                    focused && { ...tabBarItemFocused },
                  ]}
                >
                  <SvgXml
                    stroke={focused ? color.palette.gold : color.palette.lightGrey}
                    xml={ready}
                    height={20}
                  />
                  <Text style={focused ? tabBarLabelFocused : tabBarLabel}>WALLET</Text>
                </View>
              )}
              {route.name === "nfts" && (
                <View style={[tabBarItem, focused && { ...tabBarItemFocused }]}>
                  <SvgXml
                    stroke={focused ? color.palette.gold : color.palette.lightGrey}
                    xml={tabNft}
                    height={20}
                  />
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

const AppStackHeader = () => {
  return (
    <View style={NAV_HEADER_CONTAINER}>
      <Logo />
      <SettingsBtn />
    </View>
  )
}

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
          <Stack.Screen name="coinDetails" component={CoinDetailsScreen} />
          <Stack.Screen
            options={{
              presentation: "modal",
              headerShown: true,
              headerRight: SettingsBtn,
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
              headerRight: SettingsBtn,
              headerStyle: { backgroundColor: color.palette.black },
              headerLeft: Logo,
              title: "",
            }}
          />
          <Stack.Screen
            name="changePassword"
            component={ChangePasswordScreen}
            options={{
              headerShown: true,
              headerRight: SettingsBtn,
              headerStyle: { backgroundColor: color.palette.black },
              headerLeft: Logo,
              title: "",
            }}
          />
          <Stack.Screen
            name="addCurrency"
            component={AddCurrencyScreen}
            options={{
              headerShown: true,
              headerRight: SettingsBtn,
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
