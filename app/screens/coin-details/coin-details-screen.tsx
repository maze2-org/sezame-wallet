import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Image, ImageStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, PriceChart, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const COIN_IMAGE: ImageStyle = {
  width: 50,
  height: 50,
  margin: spacing[2],
}

const BTNS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}
export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    useEffect(() => {
      getCoinData(route?.params?.coinId || "bitcoin")
    }, [])

    const getCoinData = async (coin) => {
      const data = await getCoinDetails(coin)
      setCoinData(data)
    }
    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const goToSend = () => navigation.navigate("send")
    return (
      <Screen style={ROOT} preset="scroll">
        {coinData && (
          <View>
            <Image style={COIN_IMAGE} source={{ uri: coinData.image.small }}></Image>
            <Text preset="header" text={coinData.name} />
            <PriceChart data={coinData.market_data.sparkline_7d?.price}></PriceChart>
            <View style={BTNS_CONTAINER}>
              <Button text="Send" onPress={goToSend} />
              <Button text="Receive" />
            </View>
            <View>
              <Text preset="header" text="Transactions" />
            </View>
          </View>
        )}
      </Screen>
    )
  },
)
