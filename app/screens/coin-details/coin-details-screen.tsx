import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  ViewStyle,
  Image,
  ImageStyle,
  ImageBackground,
  TextStyle,
  ScrollView,
  Linking,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import IonIcons from "react-native-vector-icons/Ionicons"
import { NavigatorParamList } from "../../navigators"
import { Button, CoinCard, Footer, PriceChart, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails, getMarketChart } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"
import { useStores } from "models"
import { BackgroundStyle, CONTAINER, MainBackground, SEPARATOR } from "theme/elements"
// import InAppBrowser from "react-native-inappbrowser-reborn"

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
const COIN_DETAILS_CONTAINER: ViewStyle = {
  marginHorizontal: spacing[3],
}
const TIMEFRAME_BTNS: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: -spacing[4],
}
const BASIC_TIMEFRAME_BTN: ViewStyle = {
  width: 45,
  margin: 4,
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
  alignItems: "center",
}
const TIMEFRAME_BTN: ViewStyle = {
  ...BASIC_TIMEFRAME_BTN,
  backgroundColor: color.palette.darkBrown,
}

const TIMEFRAME_BTN_ACTIVE: ViewStyle = {
  ...BASIC_TIMEFRAME_BTN,
  backgroundColor: color.primaryDarker,
}
const TIMEFRAME_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 13,
  fontWeight: "bold",
}
const TIMEFRAME_BTN_TEXT_ACTIVE: TextStyle = {
  color: color.palette.white,
  fontSize: 13,
  fontWeight: "bold",
}
const BALANCE_STAKING_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: spacing[3],
}
const BALANCE_STAKING_CARD: ViewStyle = {
  display: "flex",
  // flex: 1,
  backgroundColor: color.palette.darkBrown,
  // margin: spacing[2],
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
  fontSize: 25,
  fontWeight: "bold",
}
const BALANCE_STAKING_CARD_NOTE: TextStyle = {
  color: color.palette.white,
  fontSize: 11,
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
}

const BALANCE_STAKING_CARD_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 12,
  flex: 3,
  textAlign: "center",
}
const TRANSACTIONS_HEADER: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing[4],
}
const TRANSACTIONS_SORT_BTN: ViewStyle = {
  backgroundColor: color.primary,
  display: "flex",
  flexDirection: "row",
  paddingHorizontal: spacing[2],
  paddingVertical: spacing[1]
}
const TRANSACTIONS_SORT_BTN_TEXT: TextStyle = {
  color: color.palette.white,
  marginLeft: spacing[1],
  fontSize: 12,
  lineHeight: 16.34
}
const TRANSACTIONS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  marginTop: spacing[3],
}
const TRANSACTION_ITEM: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: spacing[2],
}

const TRANSACTION_ITEM_BODY: ViewStyle = {
  display: "flex",
  flexDirection: "column",
}

const TRANSACTION_ITEM_HASH: TextStyle = {
  color: color.palette.white,
  fontWeight: "bold",
  fontSize: 15,
  textAlign: "right"
}
const TRANSACTION_ITEM_DATE: TextStyle = {
  color: color.palette.lightGrey,
  fontSize: 13,
  marginVertical: spacing[1],
}

export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [chartDays, setChartDays] = useState<number | "max">(1)
    const { currentWalletStore } = useStores()
    const { getAssetById } = currentWalletStore

    const asset = getAssetById(route.params.coinId)
    useEffect(() => {
      getCoinData(route?.params?.coinId)
      getChartData(chartDays)
    }, [])

    const getCoinData = async (coin) => {
      const data = await getCoinDetails(coin)
      setCoinData(data)
    }

    const getChartData = async (days) => {
      try {
        setChartDays(days)
        const data = await getMarketChart(route?.params?.coinId, days)

        setChartData(data.prices)
      } catch (error) {
        console.log(error)
      }
    }
    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const goToSend = () => navigation.navigate("send", { coinId: route.params.coinId })
    const goToReceive = () => navigation.navigate("receive", { coinId: route.params.coinId })

    const truncateHash = (hash: string) => {
      return hash.substring(0, 15) + "..." + hash.substring(hash.length - 15, hash.length)
    }
    const goBack = () => navigation.goBack()
    const openLink = async (url) => {
      // try {
      //   if (await InAppBrowser.isAvailable()) {
      //     await InAppBrowser.open(url, {
      //       // iOS Properties
      //       dismissButtonStyle: "cancel",
      //       readerMode: false,
      //       animated: true,
      //       modalPresentationStyle: "automatic",
      //       modalTransitionStyle: "coverVertical",
      //       modalEnabled: true,
      //       enableBarCollapsing: false,
      //       // Android Properties
      //       showTitle: true,
      //       enableUrlBarHiding: true,
      //       enableDefaultShare: true,
      //       forceCloseOnRedirection: false,
      //     })
      //   } else {
      Linking.openURL(url)
      //   }
      // } catch (error) {
      //   console.log(error)
      // }
    }
    return (
      <Screen style={ROOT} preset="scroll">
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <ScrollView>
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
                    <Button style={VERTICAL_ICON_BTN} onPress={goToReceive}>
                      <FontAwesome5Icon name="arrow-down" size={18} color={color.palette.white} />
                      <Text style={VERTICAL_ICON_BTN_TEXT}>Receive</Text>
                    </Button>
                  </View>
                </View>
                {chartData && chartData.length && (
                  <PriceChart data={chartData.map((p) => p[1])}></PriceChart>
                )}
                <View style={COIN_DETAILS_CONTAINER}>
                  <View style={TIMEFRAME_BTNS}>
                    {[
                      { value: 1, label: "24H" },
                      { value: 7, label: "7D" },
                      { value: 30, label: "1M" },
                      { value: 90, label: "3M" },
                      { value: 180, label: "6M" },
                      { value: "max", label: "max" },
                    ].map((frame) => (
                      <Button
                        key={frame.value}
                        style={chartDays === frame.value ? TIMEFRAME_BTN_ACTIVE : TIMEFRAME_BTN}
                      >
                        <Text
                          style={
                            chartDays === frame.value
                              ? TIMEFRAME_BTN_TEXT_ACTIVE
                              : TIMEFRAME_BTN_TEXT
                          }
                          onPress={() => getChartData(frame.value)}
                        >
                          {frame.label}
                        </Text>
                      </Button>
                    ))}
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
                    <View style={TRANSACTIONS_HEADER}>
                      <Text preset="header" text="Transactions" />
                    </View>
                    <View style={TRANSACTIONS_CONTAINER}>
                      <View style={TRANSACTION_ITEM}>
                        <View style={TRANSACTION_ITEM_BODY}>
                          <Text style={TRANSACTION_ITEM_HASH}>
                            {truncateHash("bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e")}
                          </Text>
                          <Text style={TRANSACTION_ITEM_DATE}>11/11/2019 18:59:00 </Text>
                        </View>
                        <View>
                          <Button style={TRANSACTIONS_SORT_BTN}>
                            <FontAwesome5Icon name="arrow-down" size={10} color={color.palette.white} />

                            <Text style={TRANSACTIONS_SORT_BTN_TEXT}>FROM</Text>
                          </Button>
                          <Text style={TRANSACTION_ITEM_HASH}>+0.225</Text>
                        </View>
                      </View>
                      <View style={TRANSACTION_ITEM}>
                        <View style={TRANSACTION_ITEM_BODY}>
                          <Text style={TRANSACTION_ITEM_HASH}>
                            {truncateHash("bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e")}
                          </Text>
                          <Text style={TRANSACTION_ITEM_DATE}>11/11/2019 18:59:00 </Text>
                        </View>
                        <View>
                          <Button style={TRANSACTIONS_SORT_BTN}>
                            <FontAwesome5Icon name="arrow-down" size={10} color={color.palette.white} />

                            <Text style={TRANSACTIONS_SORT_BTN_TEXT}>FROM</Text>
                          </Button>
                          <Text style={TRANSACTION_ITEM_HASH}>+0.225</Text>
                        </View>
                      </View>
                      <View style={TRANSACTION_ITEM}>
                        <View style={TRANSACTION_ITEM_BODY}>
                          <Text style={TRANSACTION_ITEM_HASH}>
                            {truncateHash("bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e")}
                          </Text>
                          <Text style={TRANSACTION_ITEM_DATE}>11/11/2019 18:59:00 </Text>
                        </View>
                        <View>
                          <Button style={TRANSACTIONS_SORT_BTN}>
                            <FontAwesome5Icon name="arrow-down" size={10} color={color.palette.white} />

                            <Text style={TRANSACTIONS_SORT_BTN_TEXT}>FROM</Text>
                          </Button>
                          <Text style={TRANSACTION_ITEM_HASH}>+0.225</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </ImageBackground>
        <Footer
          showRightButton
          rightButtonText="Explore"
          RightButtonIcon={(props) => (
            <IonIcons {...props} name="globe-outline" size={23}></IonIcons>
          )}
          onRightButtonPress={() => openLink("https://www.blockchain.com/explorer")}
          onLefButtonPress={goBack}
        ></Footer>
      </Screen>
    )
  },
)
