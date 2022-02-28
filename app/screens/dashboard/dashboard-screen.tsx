import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle, Image, ImageStyle, StyleSheet } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import { NavigatorParamList } from "../../navigators"
import { Header, Screen, Text, Button } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { TouchableOpacity } from "react-native-gesture-handler"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../models"
import { StoredWallet } from "utils/stored-wallet"
import { getBalance } from "services/api"
import { getCoinPrices } from "utils/apis"

const Fonts = [11, 15, 24, 48]
const MY_STYLE = StyleSheet.create({
  common: {
    display: "flex",
    flexDirection: "row"
  }
})
const styles = StyleSheet.create({
  ROOT: {
    backgroundColor: color.palette.lightGrey,
    flex: 1,
    padding: spacing[3]
  },
  PORTFOLIO_CONTAINER: {
    marginTop: spacing[3],
  },
  PORTFOLIO_VALUE: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  ORANGE_COLOR: {
    color: color.palette.orange
  },
  SORT_CONTAINER: {
    ...MY_STYLE.common,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[5],
  },
  SORT_BTN_CONTAINER: {
    ...MY_STYLE.common
  },
  COIN_STAKE: {
    borderRadius: 10,
    backgroundColor: color.palette.lightGrey,
    height: 20,
    width: 80,
    marginLeft: spacing[4],
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  SORT_NETWORK: {
    width: 110,
    height: 30,
    marginRight: 4,
    backgroundColor: color.palette.orange
  },
  SORT_CURRENCY: {
    width: 110,
    height: 30,
    backgroundColor: color.palette.black
  },
  SORT_TEXT: {
    fontSize: Fonts[0]
  },
  PORTFOLIO: {
    fontSize: Fonts[3],
    fontWeight: "bold",
  },
  PORTFOLIO_DOLLAR: {
    fontSize: 24,
    marginTop: -12,
    color: color.palette.orange
  },
  WALLET_NAME: {
    display: "flex",
    textAlign: "center",
    color: color.palette.orange
  },
  NETWORK_CONTAINER: {
    marginTop: spacing[3],
  },
  COIN_BOX: {
    borderRadius: 8,
    backgroundColor: color.palette.black,
    marginBottom: spacing[4]
  },
  COIN_EXPAND_CONTAINER: {
    ...MY_STYLE.common,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4]
  },
  SEPARATOR: {
    borderBottomColor: color.palette.lightGrey,
    borderBottomWidth: 0.5,
  },
  COIN_BOX_BODY: {padding: spacing[4]},
  NETWORK: {
    ...MY_STYLE.common,
    padding: spacing[2],
  },
  NETWORK_IMAGE: {
    width: 50,
    height: 50,
    marginRight: spacing[3]
  },
  COIN_CARD_CONTENT: {
    ...MY_STYLE.common,
    justifyContent: "space-between",
    flexGrow: 1
  },
  COIN_CARD_CONTENT_LEFT: {
    display: "flex",
    flexDirection: "column",
  },
  COIN_CARD_CONTENT_RIGHT: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  COIN_CARD: {
    ...MY_STYLE.common,
    alignItems: "center",
    width: "100%"
  },
  BOLD_FONT: {
    fontSize: Fonts[1],
    fontWeight: "bold",
    color: color.palette.white
  },
  LIGHT_FONT: {
    fontSize: Fonts[0],
    color: color.palette.lighterGrey
  }
})
export const DashboardScreen: FC<StackScreenProps<NavigatorParamList, "dashboard">> = observer(
  function DashboardScreen() {
    const { currentWalletStore } = useStores()
    const { wallet, assets, setBalance } = currentWalletStore
    const [totalPrice, setTotalPrice] = useState<string>('0')
    const [prices, setPrices] = useState<Array<any>>([])
    const [expandFlags, setExpandFlags] = useState<Array<boolean>>([])

    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

    useEffect(() => {
      setExpandFlags(Array(assets.length).fill(false))
      const getBalances = async () => {
        await Promise.all(
          assets.map(async (asset) => {
            const balance = await getBalance(asset)
            setBalance(asset, balance)
          }),
        )
      }

      getBalances()
    }, [])

    useEffect(() => { // get prices and calculate the total price
      // if new asset was added newly then add new flag value(false) to expandFlags
      if(assets.length !== expandFlags.length) setExpandFlags([false, ...expandFlags])

      let assetIds = ""
      assets.map((asset) => {
        assetIds += asset.cid + ','
        return 1;
      })
      assetIds.slice(0, -1)

      const getPrice = async () => {
        let _price = 0;

        const details = await getCoinPrices(assetIds)
        const _prices = []
        assets.map(asset => {
          const data = details.find((detail) => detail.id === asset.cid)
          if(data) {
            _prices.push({id: asset.cid, price: data.current_price})
            _price += data.current_price * asset.balance
          }
          return 0;
        })
        setPrices(_prices)

        // Format price separating every 3 numbers with quote
        setTotalPrice(Math.round(_price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
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
      if(data) return data.price * balance
      return 0
    }

    return (
      <Screen style={styles.ROOT} preset="scroll">
        <View style={styles.PORTFOLIO_CONTAINER}>
          <View style={styles.PORTFOLIO_VALUE}>
              <Text style={styles.ORANGE_COLOR}>~ </Text>
              <Text style={styles.PORTFOLIO}>{totalPrice}</Text>
              <Text style={styles.PORTFOLIO_DOLLAR}> $</Text>
          </View>
          <Text style={styles.WALLET_NAME}>{JSON.parse(wallet).walletName.toUpperCase()} </Text>
        </View>
        <View style={styles.SORT_CONTAINER}>
          <Text>SORT BY</Text>
          <View style={styles.SORT_BTN_CONTAINER}>
            <Button
              style={styles.SORT_NETWORK}
              textStyle={styles.SORT_TEXT}
              tx="dashboardScreen.network"
              onPress={() => {
                console.log("Sort by network")
              }}
            />
            <Button
              style={styles.SORT_CURRENCY}
              textStyle={styles.SORT_TEXT}
              tx="dashboardScreen.currency"
              onPress={() => {
                console.log("Sort by currency")
              }}
            />
          </View>
        </View>
        <View style={styles.NETWORK_CONTAINER}>
          {assets.map((asset, id) => (
            <View style={styles.COIN_BOX} key={asset.cid}>
              <TouchableOpacity style={styles.COIN_EXPAND_CONTAINER}
              onPress={() => onExpandEvent(id)}>
                <Text>{`${asset.name} Network`}</Text>
                {expandFlags[id] ?
                  <FontAwesomeIcon name="chevron-up" color={color.palette.white} /> :
                  <FontAwesomeIcon name="chevron-down" color={color.palette.white} />
                }
              </TouchableOpacity>
              <View
                style={styles.SEPARATOR}
              />
              <View style={styles.COIN_BOX_BODY}>
                <TouchableOpacity
                  style={styles.COIN_CARD}
                  onPress={() => navigation.navigate("coinDetails", { coinId: asset.cid })}
                >
                  <Image style={styles.NETWORK_IMAGE} source={{ uri: asset.image }}></Image>
                  <View style={styles.COIN_CARD_CONTENT}>
                    <View style={styles.COIN_CARD_CONTENT_LEFT}>
                      <View style={styles.SORT_BTN_CONTAINER}>
                        <Text style={styles.BOLD_FONT}>{asset.name}</Text>
                        <View style={styles.COIN_STAKE}>
                          <Text style={styles.LIGHT_FONT}>{`Staked ${'0'}%`}</Text>
                        </View>
                      </View>
                      <Text style={styles.LIGHT_FONT}>{"Base currency"}</Text>
                    </View>
                    <View style={styles.COIN_CARD_CONTENT_RIGHT}>
                      <Text style={styles.BOLD_FONT}>{asset.balance}</Text>
                      <Text style={styles.LIGHT_FONT}>{`~${getAssetPrice(asset.cid, asset.balance)}$`}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </Screen>
    )
  },
)
