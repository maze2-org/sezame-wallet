import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import { observer } from "mobx-react-lite"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { View, Image, ScrollView, Animated, StyleSheet, Dimensions } from "react-native"

import { useStores } from "../../models"
import { getBalance } from "services/api"
import { getCoinPrices } from "utils/apis"
import { useNavigation } from "@react-navigation/native"
import { color, spacing, typography } from "../../theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { NavigatorParamList } from "../../navigators"
import { Text, Button, AppScreen } from "../../components"
import { chainSymbolsToNames } from "utils/consts"

const Fonts = [11, 15, 24, 48, 64]
const MY_STYLE = StyleSheet.create({
  common: {
    display: "flex",
    flexDirection: "row",
  },
})
const styles = StyleSheet.create({
  BOLD_FONT: {
    color: color.palette.white,
    fontSize: Fonts[1],
    fontWeight: "bold",
  },
  COIN_BOX: {
    backgroundColor: color.palette.darkblack,
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  COIN_BOX_BODY: { padding: spacing[4] },
  COIN_CARD: {
    ...MY_STYLE.common,
    alignItems: "center",
    width: "100%",
  },
  COIN_CARD_CONTENT: {
    ...MY_STYLE.common,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  COIN_CARD_CONTENT_LEFT: {
    display: "flex",
    flexDirection: "column",
  },
  COIN_CARD_CONTENT_RIGHT: {
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
  },
  COIN_EXPAND_CONTAINER: {
    ...MY_STYLE.common,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  COIN_STAKE: {
    alignItems: "center",
    backgroundColor: color.palette.black,
    borderRadius: 10,
    display: "flex",
    height: 20,
    justifyContent: "center",
    marginLeft: spacing[4],
    width: 80,
  },
  COIN_STAKE_FULL: {
    backgroundColor: color.palette.gold,
  },
  LIGHT_FONT: {
    color: color.palette.lighterGrey,
    fontSize: Fonts[0],
  },
  LIGHT_FONT_FULL: {
    color: color.palette.white,
  },
  LOADING_BOX:{
    alignItems:'center',
    flex:1,
    justifyContent:'center'
  },
  NETWORK: {
    ...MY_STYLE.common,
    padding: spacing[2],
  },
  NETWORK_CONTAINER: {
    marginTop: spacing[3],
  },
  NETWORK_IMAGE: {
    height: 50,
    width: 50,
  },
  NETWORK_IMAGE_BORDER: {
    alignItems: "center",
    backgroundColor: color.palette.lineColor,
    borderRadius: 50,
    justifyContent: "center",
    marginRight: spacing[3],
  },
  ORANGE_COLOR: {
    color: color.palette.gold,
    fontFamily: typography.primary,
    fontSize: Fonts[2],
    fontWeight: "600",
    marginTop: spacing[2],
  },
  PORTFOLIO: {
    color: color.palette.white,
    fontFamily: typography.primary,
    fontSize: Fonts[4],
    fontWeight: "600",
    maxWidth: 300,
  },
  PORTFOLIO_CONTAINER: {
    elevation: 2,
    marginTop: spacing[5],
    paddingVertical: spacing[6],
    zIndex: 2,
  },
  PORTFOLIO_DOLLAR: {
    alignSelf: "flex-start",
    color: color.palette.gold,
    fontFamily: typography.primary,
    fontSize: Fonts[2],
    marginTop: spacing[3],
  },
  PORTFOLIO_OVERLAY: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.palette.black,
  },
  PORTFOLIO_VALUE: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  PORTFOLIO_WRAPPER: {
    paddingHorizontal: spacing[2],
  },
  ROOT: {
    backgroundColor: color.palette.lightGrey,
    flex: 1,
    padding: spacing[3],
  },
  SCROLL_VIEW: {
    backgroundColor: color.palette.black,
  },
  SEPARATOR: {
    borderBottomColor: color.palette.lightGrey,
    borderBottomWidth: 0.5,
  },
  SORT_BTN_CONTAINER: {
    ...MY_STYLE.common,
  },
  SORT_BY: {
    color: color.palette.grey,
    fontSize: Fonts[0],
    fontWeight: "600",
  },
  SORT_CONTAINER: {
    elevation: 3,
    ...MY_STYLE.common,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing[3],
    paddingTop: spacing[3],
    zIndex: 3,
  },
  SORT_OVERLAY: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.palette.black,
    borderBottomColor: color.palette.lineColor,
    borderBottomWidth: 1,
    borderTopColor: color.palette.lineColor,
    borderTopWidth: 1,
  },
  SORT_SWITCH: {
    backgroundColor: color.palette.darkBlack,
    marginRight: spacing[2],
  },
  SORT_SWITCH_ACTIVE: {
    backgroundColor: color.palette.gold,
  },
  SORT_TEXT: {
    color: color.palette.white,
    fontFamily: typography.primary,
    fontSize: Fonts[0],
    fontWeight: "600",
  },
  WALLET_NAME: {
    color: color.palette.gold,
    display: "flex",
    fontFamily: typography.primary,
    textAlign: "center",
  },
})

const SORT_TYPES = {
  NETWORK: "NETWORK",
  CURRENCIES: "CURRENCIES",
}

type SortTypeKeys = keyof typeof SORT_TYPES
type SortTypeValues = typeof SORT_TYPES[SortTypeKeys]
const { width } = Dimensions.get("screen")

export const DashboardScreen: FC<StackScreenProps<NavigatorParamList, "dashboard">> = observer(
  function DashboardScreen() {
    const scrollY = useRef(new Animated.Value(0)).current
    const { currentWalletStore } = useStores()
    const { wallet, assets, setBalance, refreshBalances, loadingBalance } = currentWalletStore
    const [totalPrice, setTotalPrice] = useState<string>("0")
    const [sortStatus, setSortStatus] = useState<string>("network")
    const [prices, setPrices] = useState<Array<any>>([])
    const [sortBy, setSortBy] = useState<SortTypeValues>(SORT_TYPES.NETWORK)
    const [expandFlags, setExpandFlags] = useState<Array<boolean>>([])
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

    useEffect(() => {
      // setExpandFlags(Array(assets.length).fill(false))
      // const getBalances = async () => {
      //   await Promise.all(
      //     assets.map(async (asset) => {
      //       const balance = await getBalance(asset)
      //       setBalance(asset, balance)
      //     }),
      //   )
      // }
      // getBalances()
      refreshBalances()
    }, [])

    useEffect(() => {
      // get prices and calculate the total price
      // if new asset was added newly then add new flag value(false) to expandFlags
      if (assets.length !== expandFlags.length) setExpandFlags([false, ...expandFlags])

      let assetIds = ""
      assets.map((asset) => {
        assetIds += asset.cid + ","
        return 1
      })
      assetIds.slice(0, -1)

      const getPrice = async () => {
        let _price = 0

        const details = await getCoinPrices(assetIds)
        const _prices = []
        assets.map((asset) => {
          const data = details.find((detail) => detail.id === asset.cid)
          if (data) {
            _prices.push({ id: asset.cid, price: data.current_price })
            _price += data.current_price * asset.balance
          }
          return 0
        })
        setPrices(_prices)

        // Format price separating every 3 numbers with quote
        setTotalPrice(
          Math.round(_price)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, "."),
        )
      }
      getPrice()
    }, [JSON.stringify(assets)])

    const onExpandEvent = (id) => {
      const tmp = [...expandFlags]
      tmp[id] = !tmp[id]
      setExpandFlags(tmp)
    }

    const getAssetPrice = (cid, balance) => {
      const data = prices.find((price) => price.id === cid)
      if (data) return data.price * balance
      return 0
    }

    const changeSortType = useCallback((sortType: SortTypeValues) => {
      setSortBy(sortType)
    }, [])

    const scale = scrollY.interpolate({
      inputRange: [50, 85],
      outputRange: [1, 0.4],
      extrapolate: "clamp",
    })
    const top = scrollY.interpolate({
      inputRange: [50, 85],
      outputRange: [0, -20],
      extrapolate: "clamp",
    })
    const opacity = scrollY.interpolate({
      inputRange: [50, 85],
      outputRange: [0, 1],
      extrapolate: "clamp",
    })

    const point = 60
    const translateY = scrollY.interpolate({
      inputRange: [0, point, point + 1],
      outputRange: [0, 0, 1],
    })
    const translateY2 = scrollY.interpolate({
      inputRange: [0, point + 30, point + 31],
      outputRange: [0, 0, 1],
    })

    return (
      <Animated.ScrollView
        style={styles.SCROLL_VIEW}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        <AppScreen unsafe>
          {!!loadingBalance &&
            <View style={styles.LOADING_BOX}>
              <Text>Loading</Text>
            </View>
          }
          <View style={styles.PORTFOLIO_WRAPPER}>
            <Animated.View style={[styles.PORTFOLIO_CONTAINER, { transform: [{ translateY }] }]}>
              <Animated.View style={[styles.PORTFOLIO_OVERLAY, { opacity }]} />
              <Animated.View style={[styles.PORTFOLIO_VALUE, { transform: [{ scale }] }]}>
                <Text style={styles.ORANGE_COLOR}>~ </Text>
                <Text style={styles.PORTFOLIO} adjustsFontSizeToFit numberOfLines={1}>
                  {totalPrice}
                </Text>
                <Text style={styles.PORTFOLIO_DOLLAR}> $</Text>
              </Animated.View>
              {!!wallet && (
                <Animated.Text style={[styles.WALLET_NAME, { transform: [{ translateY: top }] }]}>
                  {JSON.parse(wallet).walletName.toUpperCase()}{" "}
                </Animated.Text>
              )}
            </Animated.View>
            <Animated.View
              style={[styles.SORT_CONTAINER, { transform: [{ translateY: translateY2 }] }]}
            >
              <Animated.View style={[styles.SORT_OVERLAY, { opacity }]} />
              <Text style={styles.SORT_BY}>SORT BY</Text>
              <View style={styles.SORT_BTN_CONTAINER}>
                <Button
                  style={[
                    styles.SORT_SWITCH,
                    sortBy === SORT_TYPES.NETWORK && styles.SORT_SWITCH_ACTIVE,
                  ]}
                  textStyle={styles.SORT_TEXT}
                  tx="dashboardScreen.network"
                  onPress={() => {
                    changeSortType(SORT_TYPES.NETWORK)
                  }}
                />
                <Button
                  style={[
                    styles.SORT_SWITCH,
                    sortBy === SORT_TYPES.CURRENCIES && styles.SORT_SWITCH_ACTIVE,
                  ]}
                  textStyle={styles.SORT_TEXT}
                  tx="dashboardScreen.currency"
                  onPress={() => {
                    changeSortType(SORT_TYPES.CURRENCIES)
                  }}
                />
              </View>
            </Animated.View>
            <View style={styles.NETWORK_CONTAINER}>
              {[...assets]
                .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
                .map((asset, id) => (
                  <View style={styles.COIN_BOX} key={asset.cid}>
                    <TouchableOpacity
                      style={styles.COIN_EXPAND_CONTAINER}
                      onPress={() => onExpandEvent(id)}
                    >
                      <Text>{`${chainSymbolsToNames[asset.chain]} `}</Text>
                      {expandFlags[id] ? (
                        <FontAwesomeIcon name="chevron-up" color={color.palette.white} />
                      ) : (
                        <FontAwesomeIcon name="chevron-down" color={color.palette.white} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.SEPARATOR} />
                    <View style={styles.COIN_BOX_BODY}>
                      <TouchableOpacity
                        style={styles.COIN_CARD}
                        onPress={() => navigation.navigate("coinDetails", { coinId: asset.cid })}
                      >
                        <View style={styles.NETWORK_IMAGE_BORDER}>
                          <Image style={styles.NETWORK_IMAGE} source={{ uri: asset.image }} />
                        </View>
                        <View style={styles.COIN_CARD_CONTENT}>
                          <View style={styles.COIN_CARD_CONTENT_LEFT}>
                            <View style={styles.SORT_BTN_CONTAINER}>
                              <Text style={styles.BOLD_FONT}>{asset.name}</Text>
                              <View
                                style={[
                                  styles.COIN_STAKE,
                                  asset.value === 100 && styles.COIN_STAKE_FULL,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.LIGHT_FONT,
                                    asset.value === 100 && styles.LIGHT_FONT_FULL,
                                  ]}
                                >
                                  {`Staked ${
                                    asset.value === 0 ? asset.value : asset.value.toFixed(2)
                                  }%`}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.LIGHT_FONT}>{"Base currency"}</Text>
                          </View>
                          <View style={styles.COIN_CARD_CONTENT_RIGHT}>
                            <Text style={styles.BOLD_FONT}>{asset.balance}</Text>
                            <Text style={styles.LIGHT_FONT}>{`~${getAssetPrice(
                              asset.cid,
                              asset.balance,
                            )}$`}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </AppScreen>
      </Animated.ScrollView>
    )
  },
)
