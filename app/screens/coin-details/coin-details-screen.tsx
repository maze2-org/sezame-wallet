import React, { createRef, FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  Text as TextRn,
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
import { Button, CoinCard, Drawer, Footer, PriceChart, Screen, Text } from "../../components"

import { color } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails, getMarketChart } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"
import { useStores } from "models"
import { BackgroundStyle, MainBackground, SEPARATOR } from "theme/elements"
import styles from "./styles"
import QRCode from "react-native-qrcode-svg"
import { SvgXml } from "react-native-svg"
import { getBalance } from "services/api"
// import InAppBrowser from "react-native-inappbrowser-reborn"
const tokens = require("../../config/tokens.json")

export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const modalFlashRef = useRef<FlashMessage>()
    const [receiveIsVisible, setReceiveIsVisible] = useState<boolean>(false)
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [chartDays, setChartDays] = useState<number | "max">(1)
    const { currentWalletStore } = useStores()
    const { getAssetById, setBalance } = currentWalletStore
    const [loading, setLoading] = React.useState({})

    const asset = getAssetById(route.params.coinId)
    const tokenInfo = tokens.find((token) => token.id === route.params.coinId)
    useEffect(() => {
      getCoinData(route?.params?.coinId)
      getChartData(chartDays)
      if (asset) {
        const getBalances = async () => {
          const balance = await getBalance(asset)
          console.log("balance", balance)
          setBalance(asset, balance)
        }

        getBalances()
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
      // navigation.navigate("receive", { coinId: route.params.coinId })
      setReceiveIsVisible(value)
    }

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

    const copyAddress = () => {
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
                          <View style={styles.TRANSACTION_ITEM}>
                            <View style={styles.TRANSACTION_ITEM_BODY}>
                              <Text style={styles.TRANSACTION_ITEM_HASH}>
                                {truncateHash("bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e")}
                              </Text>
                              <Text style={styles.TRANSACTION_ITEM_DATE}>11/11/2019 18:59:00 </Text>
                            </View>
                            <View>
                              <Button style={styles.TRANSACTIONS_SORT_BTN}>
                                <FontAwesome5Icon
                                  name="arrow-down"
                                  size={10}
                                  color={color.palette.white}
                                />

                                <Text style={styles.TRANSACTIONS_SORT_BTN_TEXT}>FROM</Text>
                              </Button>
                              <Text style={styles.TRANSACTION_ITEM_HASH}>+0.225</Text>
                            </View>
                          </View>
                          <View style={styles.TRANSACTION_ITEM}>
                            <View style={styles.TRANSACTION_ITEM_BODY}>
                              <Text style={styles.TRANSACTION_ITEM_HASH}>
                                {truncateHash("bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e")}
                              </Text>
                              <Text style={styles.TRANSACTION_ITEM_DATE}>11/11/2019 18:59:00 </Text>
                            </View>
                            <View>
                              <Button style={styles.TRANSACTIONS_SORT_BTN}>
                                <FontAwesome5Icon
                                  name="arrow-down"
                                  size={10}
                                  color={color.palette.white}
                                />

                                <Text style={styles.TRANSACTIONS_SORT_BTN_TEXT}>FROM</Text>
                              </Button>
                              <Text style={styles.TRANSACTION_ITEM_HASH}>+0.225</Text>
                            </View>
                          </View>
                          <View style={styles.TRANSACTION_ITEM}>
                            <View style={styles.TRANSACTION_ITEM_BODY}>
                              <Text style={styles.TRANSACTION_ITEM_HASH}>
                                {truncateHash("bc1qzl0yv9xqkm36me3xu94qj9ejjn49ez677ukd5e")}
                              </Text>
                              <Text style={styles.TRANSACTION_ITEM_DATE}>11/11/2019 18:59:00 </Text>
                            </View>
                            <View>
                              <Button style={styles.TRANSACTIONS_SORT_BTN}>
                                <FontAwesome5Icon
                                  name="arrow-down"
                                  size={10}
                                  color={color.palette.white}
                                />

                                <Text style={styles.TRANSACTIONS_SORT_BTN_TEXT}>FROM</Text>
                              </Button>
                              <Text style={styles.TRANSACTION_ITEM_HASH}>+0.225</Text>
                            </View>
                          </View>
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
          RightButtonIcon={(props) => <IonIcons {...props} name="globe-outline" size={23} />}
          onRightButtonPress={() => openLink("https://www.blockchain.com/explorer")}
          onLefButtonPress={goBack}
        />

        <Modal
          visible={receiveIsVisible}
          animationType={"fade"}
          onRequestClose={() => toggleReceiveModal(false)}
          transparent
        >
          <TouchableOpacity
            style={styles.RECEIVE_MODAL_WRAPPER}
            activeOpacity={0}
            onPress={() => toggleReceiveModal(false)}
          >
            <View style={styles.RECEIVE_MODAL_CONTAINER}>
              <View style={styles.RECEIVE_MODAL_CLOSE_WRAPPER}>
                <TouchableOpacity
                  style={styles.RECEIVE_MODAL_CLOSE}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                  onPress={() => toggleReceiveModal(false)}
                >
                  <IonIcons name={"close-outline"} size={30} color={color.palette.white} />
                </TouchableOpacity>
              </View>

              {!!asset && (
                <View style={styles.QR_CONTAINER}>
                  <QRCode value={asset?.address} size={185} />
                </View>
              )}

              <View style={styles.RECEIVE_MODAL_COPY_WRAPPER}>
                {!asset && (
                  <View style={styles.RECEIVE_MODAL_ADDRESS}>
                    <TextRn style={styles.RECEIVE_MODAL_ADDRESS_TEXT}>
                      {asset?.address.match(/.{1,5}/g).map((e) => {
                        return <Text key={e}>{e} </Text>
                      })}
                    </TextRn>
                  </View>
                )}

                <TouchableOpacity style={styles.RECEIVE_MODAL_COPY_BUTTON} onPress={copyAddress}>
                  <View>
                    <SvgXml
                      stroke={color.palette.gold}
                      xml={copyImg}
                      height={20}
                      style={styles.COPY_ICON}
                    />
                    <Text style={styles.RECEIVE_MODAL_COPY_TEXT}>COPY</Text>
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
