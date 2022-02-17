import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle, Image, ImageStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useNavigation } from "@react-navigation/native"
import { currentWalletStore } from "../../models"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}
const PORTFOLIO_CONTAINER: ViewStyle = {
  display: "flex",
  marginTop: spacing[3],
}
const PORTFOLIO: TextStyle = {
  display: "flex",
  textAlign: "center",
  fontSize: 31,
  fontWeight: "bold",
}
const WALLET_NAME: TextStyle = {
  display: "flex",
  textAlign: "center",
}

const NETWORK_CONTAINER: ViewStyle = {
  marginTop: spacing[3],
}
const NETWORK: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  padding: spacing[2],
}
const NETWORK_IMAGE: ImageStyle = {
  width: 50,
  height: 50,
  margin: spacing[2],
}
const NETWOKRS = [
  {
    name: "bitcoin",
    ticker: "BTC",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    name: "ethereum",
    ticker: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
]

export const DashboardScreen: FC<StackScreenProps<NavigatorParamList, "dashboard">> = observer(
  function DashboardScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    // const navigation = useNavigation()

    useEffect(() => {
      currentWalletStore.getWallet().then((wallet) => {
        console.log(JSON.stringify(wallet, null, 2))
      })
    }, [])

    return (
      <Screen style={ROOT} preset="scroll">
        <View style={PORTFOLIO_CONTAINER}>
          <Text style={PORTFOLIO}>~43'234 $</Text>
          <Text style={WALLET_NAME}>Wallet name </Text>
        </View>
        <View style={NETWORK_CONTAINER}>
          {NETWOKRS.map((network) => (
            <View style={NETWORK} key={network.name}>
              <TouchableOpacity
                onPress={() => navigation.navigate("coinDetails", { coinId: network.name })}
              >
                <Image style={NETWORK_IMAGE} source={{ uri: network.image }}></Image>
              </TouchableOpacity>
              <Text>{network.name}</Text>
              {/* <Text>2.343</Text> */}
            </View>
          ))}
        </View>
      </Screen>
    )
  },
)
