/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from "react"
import { TextStyle, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
  WelcomeScreen,
  DemoScreen,
  DemoListScreen,
  HomeScreen,
  ImportWalletScreen,
  CreateWalletScreen,
  DashboardScreen,
} from "../screens"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import IonicIcon from "react-native-vector-icons/Ionicons"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { color, spacing } from "../theme"
import { WalletReadyScreen } from "../screens/wallet-ready/wallet-ready-screen"
import { NftsScreen } from "../screens/nfts/nfts-screen"
import { CoinDetailsScreen } from "../screens/coin-details/coin-details-screen"

const NAV_HEADER_BTN_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
}
const NAV_HEADER_BTN: ViewStyle = {
  padding: spacing[2],
}

const BTN_ICON: TextStyle = {
  color: color.palette.black,
}
const SettingsBtn = () => (
  <View style={NAV_HEADER_BTN_CONTAINER}>
    <TouchableOpacity style={NAV_HEADER_BTN}>
      <FontAwesome5Icon style={BTN_ICON} name="qrcode" size={23} />
    </TouchableOpacity>
    <TouchableOpacity style={NAV_HEADER_BTN}>
      <FontAwesome5Icon style={BTN_ICON} name="plus" size={23} />
    </TouchableOpacity>
    <TouchableOpacity style={NAV_HEADER_BTN}>
      <FontAwesome5Icon style={BTN_ICON} name="user-cog" size={23} />
    </TouchableOpacity>
  </View>
)

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
  demo: undefined
  demoList: undefined
  home: undefined
  importWallet: undefined
  createWallet: undefined
  dashboard: undefined
  walletReady: undefined
  nfts: undefined
  coinDetails: {
    coinId: string
  }
  // 🔥 Your screens go here
}

const Tab = createBottomTabNavigator()
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // eslint-disable-next-line react/display-name
        tabBarIcon: ({ focused, currentColor, size }) => {
          if (route.name === "home") {
            return <FontAwesome5Icon name="wallet" size={23} color={currentColor} />
          } else if (route.name === "nfts") {
            return <FontAwesomeIcon name="file-picture-o" size={size} color={currentColor} />
          }
        },
      })}
    >
      <Tab.Screen name="home" component={DashboardScreen} />
      <Tab.Screen name="nfts" component={NftsScreen} />
    </Tab.Navigator>
  )
}
// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="welcome"
    >
      <Stack.Screen name="welcome" component={WelcomeScreen} />
      <Stack.Screen name="demo" component={DemoScreen} />
      <Stack.Screen name="demoList" component={DemoListScreen} />
      <Stack.Screen
        name="home"
        component={BottomTabNavigator}
        options={{ headerShown: true, headerRight: SettingsBtn }}
      />
      <Stack.Screen name="importWallet" component={ImportWalletScreen} />
      <Stack.Screen name="createWallet" component={CreateWalletScreen} />
      <Stack.Screen
        name="dashboard"
        component={BottomTabNavigator}
        options={{
          headerShown: true,
          headerRight: SettingsBtn,
          headerBackVisible: false,
          headerTitle: "",
        }}
      />
      <Stack.Screen name="walletReady" component={WalletReadyScreen} />
      <Stack.Screen name="coinDetails" component={CoinDetailsScreen} />
      {/** 🔥 Your screens go here */}
    </Stack.Navigator>
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
