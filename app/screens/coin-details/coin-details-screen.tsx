import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, ImageStyle, ImageBackground } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, CoinCard, PriceChart, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"
import { useStores } from "models"
import { BackgroundStyle, MainBackground } from "theme/elements"

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
export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)

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
                  imageUrl={coinData.image?.small}
                  symbol={coinData.symbol}
                  chain={asset.chain}
                />
                <View style={BTNS_CONTAINER}>
                  <Button text="Send" onPress={goToSend} />
                  <Button text="Receive" onPress={goToReceive} />
                </View>
              </View>

              <PriceChart data={coinData.market_data.sparkline_7d?.price}></PriceChart>
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
