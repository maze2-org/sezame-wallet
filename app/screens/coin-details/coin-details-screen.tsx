import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, ImageStyle, ImageBackground, TextStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { NavigatorParamList } from "../../navigators"
import { Button, CoinCard, PriceChart, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"
import { useStores } from "models"
import { BackgroundStyle, MainBackground, SEPARATOR } from "theme/elements"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const BTNS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}
const COIN_CARD: ViewStyle = {
  flex: 1,
}
const COIN_CARD_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
}

const VERTICAL_ICON_BTN: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
}

const VERTICAL_ICON_BTN_TEXT: TextStyle = {
  fontSize: 12,
}

const TIMEFRAME_BTNS: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: -spacing[4],
  marginHorizontal: spacing[2],
}

const TIMEFRAME_BTN: ViewStyle = {
  backgroundColor: color.palette.darkBrown,
  width: 45,

  margin: 4,
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
  alignItems: "center",
}
const TIMEFRAME_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 13,
  fontWeight: "bold",
}

const BALANCE_STAKING_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}
const BALANCE_STAKING_CARD: ViewStyle = {
  display: "flex",
  flex: 1,
  backgroundColor: color.palette.darkBrown,
  margin: spacing[3],
  borderRadius: 10,
}
const BALANCE_STAKING_CARD_BODY: ViewStyle = {
  padding: spacing[3],
}
const BALANCE_STAKING_CARD_HEADER: TextStyle = {
  color: color.primaryDarker,
  fontSize: 15,
}
const BALANCE_STAKING_CARD_AMOUNT: TextStyle = {
  color: color.palette.white,
  fontSize: 24,
  fontWeight: "bold",
}
const BALANCE_STAKING_CARD_NOTE: TextStyle = {
  color: color.palette.white,
  fontSize: 12,
}
const BALANCE_STAKING_CARD_BTN: ViewStyle = {
  backgroundColor: color.transparent,
  padding: spacing[1],
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  height: 59,
}
const BALANCE_STAKING_CARD_BTN_ICON: TextStyle = {
  color: color.palette.white,
  flex: 1,
}

const BALANCE_STAKING_CARD_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 12,
  flex: 3,
  textAlign: "center",
}

export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    // const [chart]
    const { currentWalletStore } = useStores()
    const { getAssetById } = currentWalletStore

    const asset = getAssetById(route.params.coinId)
    useEffect(() => {
      getCoinData(route?.params?.coinId || "bitcoin")
    }, [])

    const getCoinData = async (coin) => {
      const data = await getCoinDetails(coin)
      setCoinData(data)
    }
    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const goToSend = () => navigation.navigate("send", { coinId: route.params.coinId })
    const goToReceive = () => navigation.navigate("receive", { coinId: route.params.coinId })
    return (
      <Screen style={ROOT} preset="scroll">
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          {coinData && (
            <View>
              <View style={COIN_CARD_CONTAINER}>
                <CoinCard
                  style={COIN_CARD}
                  name={coinData.name}
                  balance={asset.balance}
                  imageUrl={coinData.image?.large}
                  symbol={coinData.symbol}
                  chain={asset.chain}
                />
                <View style={BTNS_CONTAINER}>
                  <Button style={VERTICAL_ICON_BTN} onPress={goToSend}>
                    <FontAwesome5Icon name="arrow-up" size={18} color={color.palette.white} />
                    <Text style={VERTICAL_ICON_BTN_TEXT}>Send</Text>
                  </Button>
                  <Button style={VERTICAL_ICON_BTN} onPress={goToSend}>
                    <FontAwesome5Icon name="arrow-down" size={18} color={color.palette.white} />
                    <Text style={VERTICAL_ICON_BTN_TEXT}>Receive</Text>
                  </Button>
                </View>
              </View>

              <PriceChart data={coinData.market_data.sparkline_7d?.price}></PriceChart>
              <View style={TIMEFRAME_BTNS}>
                <Button style={TIMEFRAME_BTN}>
                  <Text style={TIMEFRAME_BTN_TEXT}>24H</Text>
                </Button>
                <Button style={TIMEFRAME_BTN}>
                  <Text style={TIMEFRAME_BTN_TEXT}>7D</Text>
                </Button>
                <Button style={TIMEFRAME_BTN}>
                  <Text style={TIMEFRAME_BTN_TEXT}>1M</Text>
                </Button>
                <Button style={TIMEFRAME_BTN}>
                  <Text style={TIMEFRAME_BTN_TEXT}>3M</Text>
                </Button>
                <Button style={TIMEFRAME_BTN}>
                  <Text style={TIMEFRAME_BTN_TEXT}>6M</Text>
                </Button>
                <Button style={TIMEFRAME_BTN}>
                  <Text style={TIMEFRAME_BTN_TEXT}>1Y</Text>
                </Button>
              </View>
              <View style={BALANCE_STAKING_CONTAINER}>
                <View style={BALANCE_STAKING_CARD}>
                  <View style={BALANCE_STAKING_CARD_BODY}>
                    <Text style={BALANCE_STAKING_CARD_HEADER}> Available balance</Text>
                    <Text style={BALANCE_STAKING_CARD_AMOUNT}> 0.459</Text>
                    <Text style={BALANCE_STAKING_CARD_NOTE}> (~1$)</Text>
                  </View>

                  <View style={SEPARATOR}></View>
                  <Button style={BALANCE_STAKING_CARD_BTN}>
                    <MaterialCommunityIcons
                      style={BALANCE_STAKING_CARD_BTN_ICON}
                      size={18}
                      name="swap-vertical-circle-outline"
                    ></MaterialCommunityIcons>
                    <Text style={BALANCE_STAKING_CARD_BTN_TEXT}>SWAP</Text>
                  </Button>
                </View>
                <View style={BALANCE_STAKING_CARD}>
                  <View style={BALANCE_STAKING_CARD_BODY}>
                    <Text style={BALANCE_STAKING_CARD_HEADER}> Staking balance</Text>
                    <Text style={BALANCE_STAKING_CARD_AMOUNT}> 0.459</Text>
                    <Text style={BALANCE_STAKING_CARD_NOTE}>Available rewards 0.02 (~1$)</Text>
                  </View>
                  <View style={SEPARATOR}></View>
                  <Button style={BALANCE_STAKING_CARD_BTN}>
                    <FontAwesome5Icon
                      size={18}
                      style={BALANCE_STAKING_CARD_BTN_ICON}
                      name="database"
                    ></FontAwesome5Icon>
                    <Text style={BALANCE_STAKING_CARD_BTN_TEXT}>MANAGE STAKING</Text>
                  </Button>
                </View>
              </View>
              <View>
                <Text preset="header" text="Transactions" />
              </View>
            </View>
          )}
        </ImageBackground>
      </Screen>
    )
  },
)
