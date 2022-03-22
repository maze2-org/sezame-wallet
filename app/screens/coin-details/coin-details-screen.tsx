import React, { createRef, FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  Text as TextRn,
<<<<<<< HEAD
  ViewStyle,
=======
>>>>>>> muhammed-dev
  ImageBackground,
  ScrollView,
  Linking,
  Modal,
  TouchableOpacity,
  Clipboard,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import IonIcons from "react-native-vector-icons/Ionicons"
import copyImg from "../../../assets/svg/copy.svg"
import { NavigatorParamList } from "../../navigators"
import FlashMessage, { showMessage } from "react-native-flash-message"
<<<<<<< HEAD
import {
  Button,
  CoinCard,
  Footer,
  PriceChart,
  Screen,
  Text,
  TransactionRow,
} from "../../components"
import { color, spacing } from "../../theme"
=======
import { Button, CoinCard, Drawer, Footer, PriceChart, Screen, Text } from "../../components"

import { color } from "../../theme"
>>>>>>> muhammed-dev
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails, getMarketChart } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"
import { useStores } from "models"
<<<<<<< HEAD
import { BackgroundStyle, CONTAINER, MainBackground, SEPARATOR } from "theme/elements"
=======
import { BackgroundStyle, MainBackground, SEPARATOR } from "theme/elements"
import styles from "./styles"
>>>>>>> muhammed-dev
import QRCode from "react-native-qrcode-svg"
import { SvgXml } from "react-native-svg"
import { CryptoTransaction, getBalance, getTransactions, getTransactionsUrl } from "services/api"
// import InAppBrowser from "react-native-inappbrowser-reborn"
<<<<<<< HEAD
const { height } = Dimensions.get("screen")

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

const TRANSACTIONS_CONTAINER: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  marginTop: spacing[3],
}

const RECEIVE_MODAL_WRAPPER: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  height: height,
  backgroundColor: "rgba(0,0,0,0.3)",
}
const RECEIVE_MODAL_CONTAINER: ViewStyle = {
  width: 317,
  alignItems: "center",
  borderRadius: 8,
  backgroundColor: color.palette.noise,
  paddingHorizontal: 10,
}
const QR_CONTAINER: ViewStyle = {
  display: "flex",
  alignItems: "center",
  alignContent: "center",
  backgroundColor: color.palette.white,
  padding: 20,
  borderRadius: 8,
  marginBottom: 40,
  marginVertical: 20,
}
const RECEIVE_MODAL_CLOSE_WRAPPER: ViewStyle = {
  width: "100%",
  alignItems: "flex-end",
}
const RECEIVE_MODAL_CLOSE: ViewStyle = {
  marginTop: 10,
}
const RECEIVE_MODAL_COPY_WRAPPER: ViewStyle = {
  backgroundColor: color.palette.darkblack,
  width: 280,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 25,
}
const RECEIVE_MODAL_ADDRESS: ViewStyle = {
  padding: 20,
}
const RECEIVE_MODAL_ADDRESS_TEXT: TextStyle = {
  textAlign: "center",
}
const RECEIVE_MODAL_COPY_BUTTON: ViewStyle = {
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  height: 40,
  borderTopColor: color.palette.lineColor,
  borderTopWidth: 1,
}
const RECEIVE_MODAL_COPY_TEXT: TextStyle = {
  fontSize: 11,
}
const COPY_ICON: ViewStyle = {
  position: "absolute",
  left: -40,
}
=======
const tokens = require("../../config/tokens.json")
>>>>>>> muhammed-dev

export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const modalFlashRef = useRef<FlashMessage>()
    const [receiveIsVisible, setReceiveIsVisible] = useState<boolean>(false)
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [transactions, setTransactions] = useState<CryptoTransaction[]>([])
    const [chartDays, setChartDays] = useState<number | "max">(1)
    const { currentWalletStore } = useStores()
    const { getAssetById, setBalance } = currentWalletStore
    const [loading, setLoading] = React.useState({})

    const [explorerUrl, setExplorerUrl] = useState<string>("")

    const asset = getAssetById(route.params.coinId)
<<<<<<< HEAD

    useEffect(() => {
      getCoinData(route?.params?.coinId)
      getChartData(chartDays)
      const _getBalances = async () => {
        const balance = await getBalance(asset)
        setBalance(asset, balance)
=======
    const [explorerUrl, setExplorerUrl] = useState<string>("")
    const tokenInfo = tokens.find((token) => token.id === route.params.coinId)
    useEffect(() => {
      getCoinData(route?.params?.coinId)
      getChartData(chartDays)
      if (asset) {
        const _getBalances = async () => {
          const balance = await getBalance(asset)
          console.log("balance", balance)
          setBalance(asset, balance)
        }

        const _getTransactions = async () => {
          const tsx = await getTransactions(asset)
          setTransactions(tsx)
        }

        _getTransactions()
        _getBalances()
        setExplorerUrl(getTransactionsUrl(asset))
>>>>>>> muhammed-dev
      }
    }, [])

    const addAsset = React.useCallback((chain: any) => {
      setLoading((loading) => ({ ...loading, [chain.id]: true }))
      console.log({ currentWalletStore })
      currentWalletStore.getWallet().then((wallet) => {
        wallet
          .addAutoAsset({
            name: tokenInfo.name,
            chain: chain.id,
            symbol: tokenInfo.symbol,
            cid: tokenInfo.id,
          } as any)
          .then(async () => {
            await currentWalletStore.setAssets(wallet.assets)

<<<<<<< HEAD
      const _getTransactions = async () => {
        const tsx = await getTransactions(asset)
        setTransactions(tsx)
      }

      _getTransactions()
      _getBalances()
      setExplorerUrl(getTransactionsUrl(asset))
=======
            await wallet.save()
            showMessage({
              message: "Coin added to wallet",
              type: "success",
            })
          })
          .catch((e) => {
            console.log(e)
          })
          .finally(() => {
            console.log(JSON.stringify(wallet, null, 2))
            setLoading((loading) => ({ ...loading, [chain.id]: false }))
          })
      })
>>>>>>> muhammed-dev
    }, [])

    const getCoinData = async (coin) => {
      try {
        const data = await getCoinDetails(coin)
        setCoinData(data)
      } catch (error) {
        console.log("error Getting coin data", error)
      }
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
    const toggleReceiveModal = (value: boolean) => {
      setReceiveIsVisible(value)
    }
    const goBack = () => navigation.goBack()
    const openLink = async (url) => {
      Linking.openURL(url)
    }

    const copyAddress = () => {
<<<<<<< HEAD
      Clipboard.setString(asset.address)
      Clipboard.getString()
        .then((link) => {
          modalFlashRef.current &&
            modalFlashRef.current.showMessage({
              message: "Copied to clipboard",
              type: "success",
            })
        })
        .catch((e) => {
          console.log(e)
        })
=======
      if (asset) {
        Clipboard.setString(asset.address)
        Clipboard.getString()
          .then((link) => {
            modalFlashRef.current &&
              modalFlashRef.current.showMessage({
                message: "Copied to clipboard",
                type: "success",
              })
          })
          .catch((e) => {
            console.log(e)
          })
      }
>>>>>>> muhammed-dev
    }

    return (
      <Screen style={styles.ROOT} preset="scroll">
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <ScrollView>
            {!!coinData && (
              <View>
                <View style={styles.COIN_CARD_CONTAINER}>
                  <CoinCard
                    style={styles.COIN_CARD}
                    name={coinData.name}
                    balance={asset?.balance}
                    imageUrl={coinData.image?.large}
                    symbol={coinData.symbol}
                    chain={asset?.chain}
                  />
<<<<<<< HEAD
                  <View style={BTNS_CONTAINER}>
                    <Button style={VERTICAL_ICON_BTN} onPress={goToSend}>
                      <FontAwesome5Icon name="arrow-up" size={18} color={color.palette.white} />
                      <Text style={VERTICAL_ICON_BTN_TEXT}>Send</Text>
                    </Button>
                    <Button style={VERTICAL_ICON_BTN} onPress={() => toggleReceiveModal(true)}>
                      <FontAwesome5Icon name="arrow-down" size={18} color={color.palette.white} />
                      <Text style={VERTICAL_ICON_BTN_TEXT}>Receive</Text>
                    </Button>
                  </View>
=======
                  {!!asset && (
                    <View style={styles.BTNS_CONTAINER}>
                      <Button style={styles.VERTICAL_ICON_BTN} onPress={goToSend}>
                        <FontAwesome5Icon name="arrow-up" size={18} color={color.palette.white} />
                        <Text style={styles.VERTICAL_ICON_BTN_TEXT}>Send</Text>
                      </Button>
                      <Button
                        style={styles.VERTICAL_ICON_BTN}
                        onPress={() => toggleReceiveModal(true)}
                      >
                        <FontAwesome5Icon name="arrow-down" size={18} color={color.palette.white} />
                        <Text style={styles.VERTICAL_ICON_BTN_TEXT}>Receive</Text>
                      </Button>
                    </View>
                  )}
>>>>>>> muhammed-dev
                </View>
                {!!chartData && !!chartData.length && (
                  <PriceChart data={chartData.map((p) => p[1])} />
                )}
                <View style={styles.COIN_DETAILS_CONTAINER}>
                  {!!chartData && !!chartData.length && (
                    <View style={styles.TIMEFRAME_BTNS}>
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
                          style={
                            chartDays === frame.value
                              ? styles.TIMEFRAME_BTN_ACTIVE
                              : styles.TIMEFRAME_BTN
                          }
                        >
<<<<<<< HEAD
                          {frame.label}
                        </Text>
                      </Button>
                    ))}
                  </View>
                  <View style={BALANCE_STAKING_CONTAINER}>
                    <View style={BALANCE_STAKING_CARD}>
                      <View style={BALANCE_STAKING_CARD_BODY}>
                        <Text style={BALANCE_STAKING_CARD_HEADER}> Available balance</Text>
                        <Text style={BALANCE_STAKING_CARD_AMOUNT}>{asset.balance}</Text>
                        <Text style={BALANCE_STAKING_CARD_NOTE}> (~1$)</Text>
                      </View>

                      <View style={SEPARATOR} />
                      <Button style={BALANCE_STAKING_CARD_BTN}>
                        <MaterialCommunityIcons
                          style={BALANCE_STAKING_CARD_BTN_ICON}
                          size={18}
                          name="swap-vertical-circle-outline"
                        />
                        <Text style={BALANCE_STAKING_CARD_BTN_TEXT}>SWAP</Text>
                      </Button>
                    </View>
                    <View style={BALANCE_STAKING_CARD}>
                      <View style={BALANCE_STAKING_CARD_BODY}>
                        <Text style={BALANCE_STAKING_CARD_HEADER}> Staking balance</Text>
                        <Text style={BALANCE_STAKING_CARD_AMOUNT}> 0.459</Text>
                        <Text style={BALANCE_STAKING_CARD_NOTE}>Available rewards 0.02 (~1$)</Text>
                      </View>
                      <View style={SEPARATOR} />
                      <Button style={BALANCE_STAKING_CARD_BTN}>
                        <FontAwesome5Icon
                          size={18}
                          style={BALANCE_STAKING_CARD_BTN_ICON}
                          name="database"
                        />
                        <Text style={BALANCE_STAKING_CARD_BTN_TEXT}>MANAGE STAKING</Text>
                      </Button>
                    </View>
                  </View>
                  <View>
                    <View style={TRANSACTIONS_HEADER}>
                      <Text preset="header" text="Transactions" />
                    </View>
                    <View style={TRANSACTIONS_CONTAINER}>
                      {transactions.map((tx) => (
                        <TransactionRow asset={asset} transaction={tx} />
=======
                          <Text
                            style={
                              chartDays === frame.value
                                ? styles.TIMEFRAME_BTN_TEXT_ACTIVE
                                : styles.TIMEFRAME_BTN_TEXT
                            }
                            onPress={() => getChartData(frame.value)}
                          >
                            {frame.label}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  )}
                  {asset && (
                    <View>
                      <View style={styles.BALANCE_STAKING_CONTAINER}>
                        <View style={styles.BALANCE_STAKING_CARD}>
                          <View style={styles.BALANCE_STAKING_CARD_BODY}>
                            <Text style={styles.BALANCE_STAKING_CARD_HEADER}>
                              Available balance
                            </Text>
                            <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>{asset.balance}</Text>
                            <Text style={styles.BALANCE_STAKING_CARD_NOTE}> (~1$)</Text>
                          </View>

                          <View style={SEPARATOR} />
                          <Button style={styles.BALANCE_STAKING_CARD_BTN}>
                            <MaterialCommunityIcons
                              style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                              size={18}
                              name="swap-vertical-circle-outline"
                            />
                            <Text style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>SWAP</Text>
                          </Button>
                        </View>
                        <View style={styles.BALANCE_STAKING_CARD}>
                          <View style={styles.BALANCE_STAKING_CARD_BODY}>
                            <Text style={styles.BALANCE_STAKING_CARD_HEADER}> Staking balance</Text>
                            <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}> 0.459</Text>
                            <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                              Available rewards 0.02 (~1$)
                            </Text>
                          </View>
                          <View style={SEPARATOR} />
                          <Button style={styles.BALANCE_STAKING_CARD_BTN}>
                            <FontAwesome5Icon
                              size={18}
                              style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                              name="database"
                            />
                            <Text style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>MANAGE STAKING</Text>
                          </Button>
                        </View>
                      </View>
                      <View>
                        <View style={styles.TRANSACTIONS_HEADER}>
                          <Text preset="header" text="Transactions" />
                        </View>
                        <View style={styles.TRANSACTIONS_CONTAINER}>
                          {transactions.map((tx) => (
                            <TransactionRow asset={asset} transaction={tx} />
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {!asset && !!tokenInfo && (
                    <View style={styles.TOKEN_CHAINS_CONTAINER}>
                      {tokenInfo.chains.map((chain) => (
                        <View style={styles.TOKEN_CHAIN_ROW} key={chain.id}>
                          <Text>{chain.name}</Text>
                          <Button onPress={() => addAsset(chain)}>
                            <Text style={styles.ADD_TO_PORTFOLIO_BTN}>Add to portfolio</Text>
                          </Button>
                        </View>
>>>>>>> muhammed-dev
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </ImageBackground>
        <Footer
          showRightButton={!!asset}
          rightButtonText="Explore"
<<<<<<< HEAD
          rightButtonDisabled={!!!explorerUrl}
=======
>>>>>>> muhammed-dev
          RightButtonIcon={(props) => <IonIcons {...props} name="globe-outline" size={23} />}
          onRightButtonPress={() => explorerUrl && openLink(explorerUrl)}
          onLeftButtonPress={goBack}
        />

        <Modal
          visible={receiveIsVisible}
          animationType={"fade"}
          onRequestClose={() => toggleReceiveModal(false)}
          transparent
        >
          <TouchableOpacity
<<<<<<< HEAD
            style={RECEIVE_MODAL_WRAPPER}
            activeOpacity={0}
            onPress={() => toggleReceiveModal(false)}
          >
            <View style={RECEIVE_MODAL_CONTAINER}>
              <View style={RECEIVE_MODAL_CLOSE_WRAPPER}>
=======
            style={styles.RECEIVE_MODAL_WRAPPER}
            activeOpacity={0}
            onPress={() => toggleReceiveModal(false)}
          >
            <View style={styles.RECEIVE_MODAL_CONTAINER}>
              <View style={styles.RECEIVE_MODAL_CLOSE_WRAPPER}>
>>>>>>> muhammed-dev
                <TouchableOpacity
                  style={styles.RECEIVE_MODAL_CLOSE}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                  onPress={() => toggleReceiveModal(false)}
                >
                  <IonIcons name={"close-outline"} size={30} color={color.palette.white} />
                </TouchableOpacity>
              </View>

<<<<<<< HEAD
              <View style={QR_CONTAINER}>
                <QRCode value={asset.address} size={185} />
              </View>

              <View style={RECEIVE_MODAL_COPY_WRAPPER}>
                <View style={RECEIVE_MODAL_ADDRESS}>
                  <TextRn style={RECEIVE_MODAL_ADDRESS_TEXT}>
                    {asset.address.match(/.{1,5}/g).map((e) => {
                      return <Text key={e}>{e} </Text>
                    })}
                  </TextRn>
=======
              {!!asset && (
                <View style={styles.QR_CONTAINER}>
                  <QRCode value={asset?.address} size={185} />
>>>>>>> muhammed-dev
                </View>
              )}

<<<<<<< HEAD
                <TouchableOpacity style={RECEIVE_MODAL_COPY_BUTTON} onPress={copyAddress}>
=======
              <View style={styles.RECEIVE_MODAL_COPY_WRAPPER}>
                {!asset && (
                  <View style={styles.RECEIVE_MODAL_ADDRESS}>
                    <TextRn style={styles.RECEIVE_MODAL_ADDRESS_TEXT}>
                      {asset.address.match(/.{1,5}/g).map((e) => {
                        return <Text key={e}>{e} </Text>
                      })}
                    </TextRn>
                  </View>
                )}

                <TouchableOpacity style={styles.RECEIVE_MODAL_COPY_BUTTON} onPress={copyAddress}>
>>>>>>> muhammed-dev
                  <View>
                    <SvgXml
                      stroke={color.palette.gold}
                      xml={copyImg}
                      height={20}
<<<<<<< HEAD
                      style={COPY_ICON}
                    />
                    <Text style={RECEIVE_MODAL_COPY_TEXT}>COPY</Text>
=======
                      style={styles.COPY_ICON}
                    />
                    <Text style={styles.RECEIVE_MODAL_COPY_TEXT}>COPY</Text>
>>>>>>> muhammed-dev
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
          <FlashMessage ref={modalFlashRef} position="bottom" />
        </Modal>
      </Screen>
    )
  },
)
