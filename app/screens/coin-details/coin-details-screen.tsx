import React, { useMemo, FC, useEffect, useRef, useState } from "react"
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
import IonIcons from "react-native-vector-icons/Ionicons"
import copyImg from "../../../assets/svg/copy.svg"
import { NavigatorParamList } from "../../navigators"
import FlashMessage, { showMessage } from "react-native-flash-message"
import {
  Button,
  CoinCard,
  Footer,
  PriceChart,
  Screen,
  Text,
  TransactionRow,
} from "../../components"

import { color } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { getCoinDetails, getMarketChart } from "utils/apis"
import { CoingeckoCoin } from "types/coingeckoCoin"
import { useStores } from "models"
import { BackgroundStyle, MainBackground, SEPARATOR } from "theme/elements"
import styles from "./styles"
import QRCode from "react-native-qrcode-svg"
import { SvgXml } from "react-native-svg"
import {
  CryptoTransaction,
  getBalance,
  getTransactions,
  getTransactionStatus,
  getTransactionsUrl,
} from "services/api"
import { autorun } from "mobx"
import {
  StackingBalanceProps
} from "../staking-balance/StakingBalance"
// import InAppBrowser from "react-native-inappbrowser-reborn"
const tokens = require("../../config/tokens.json")

export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const modalFlashRef = useRef<FlashMessage>()
    const [receiveIsVisible, setReceiveIsVisible] = useState<boolean>(false)
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [transactions, setTransactions] = useState<CryptoTransaction[]>([])
    const [chartDays, setChartDays] = useState<number | "max">(1)
    const { currentWalletStore, pendingTransactions, exchangeRates } = useStores()
    const { getAssetById, setBalance, assets } = currentWalletStore
    const [loading, setLoading] = React.useState({})
    const [updatingWallet, setUpdatingWallet] = React.useState<boolean>(false)

    const [explorerUrl, setExplorerUrl] = useState<string>("")

    const asset = getAssetById(route.params.coinId)
    const tokenInfo = tokens.find((token) => token.id === route.params.coinId)

    const _getBalances = async () => {
      const balance = await getBalance(asset)
      setBalance(asset, balance)
    }

    const _getTransactions = async () => {
      const tsx = await getTransactions(asset)
      setTransactions(tsx)
    }

    const updateTransactions = () => {
      const txList = pendingTransactions.getPendingTxsForAsset(asset)
      txList.forEach((tx) => {
        getTransactionStatus(asset, tx.txId)
          .then((status) => {
            if (status === "success" || status === "failed") {
              pendingTransactions.remove(asset, tx)
              _getBalances()
              _getTransactions()
            }
          })
          .catch((err) => {
            console.error("GOT ERROR!!! Removing it...", err)
            // pendingTransactions.remove(asset, tx)
          })
      })
    }

    const updateChart = () => {
      getChartData()
    }

    useEffect(() => {
      // Get transaction once then once every 10sec
      updateTransactions()
      const interval = setInterval(updateTransactions, 20000)

      // Get graph data once then once every 60secs
      updateChart()

      getCoinData(route?.params?.coinId)

      if (asset) {
        _getTransactions()
        _getBalances()
        setExplorerUrl(getTransactionsUrl(asset))
      }

      return () => {
        clearInterval(interval)
      }
    }, [])

    // Handle the graph duration selector
    React.useEffect(() => {
      getChartData()

      const intervalChart = setInterval(updateChart, 60000)
      return () => {
        clearInterval(intervalChart)
      }
    }, [chartDays])

    const addAsset = React.useCallback((chain: any) => {
      setLoading((loading) => ({ ...loading, [chain.id]: true }))
      setUpdatingWallet(true)
      currentWalletStore.getWallet().then((wallet) => {
        wallet
          .addAutoAsset({
            name: tokenInfo.name,
            chain: chain.id,
            symbol: tokenInfo.symbol,
            cid: tokenInfo.id,
            type: tokenInfo.type,
            contract: `${chain.contract}`,
            image: tokenInfo.thumb
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
            showMessage({
              message: "Something went wrong",
              type: "danger",
            })
          })
          .finally(() => {
            setLoading((loading) => ({ ...loading, [chain.id]: false }))
            setUpdatingWallet(false)
          })
      })
    }, [])

    const removeAsset = React.useCallback((chain: any) => {
      setLoading((loading) => ({ ...loading, [chain.id]: true }))
      setUpdatingWallet(true)

      currentWalletStore.getWallet().then((wallet) => {
        wallet.removeAsset(chain.id, tokenInfo.symbol)
        currentWalletStore.setAssets(wallet.assets)
        wallet
          .save()
          .then(() => {
            showMessage({
              message: "Coin removed from wallet",
              type: "success",
            })
          })
          .catch((err) => {
            console.log(err)
            showMessage({
              message: "Something went wrong",
              type: "danger",
            })
          })
          .finally(() => {
            setLoading((loading) => ({ ...loading, [chain.id]: false }))
            setUpdatingWallet(false)
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

    const getChartData = async () => {
      try {
        // setChartDays(days)
        const data = await getMarketChart(route?.params?.coinId, chartDays)

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

    const switchChart = (type: number | "max") => {
      setChartDays(type)
    }

    const navigateStakingBalance = () => {
      navigation.navigate("stakingBalance",
        {
          image: coinData.image?.large,
          name: coinData?.name,
          asset: !!asset && !route.params.fromAddCurrency && asset,
        },
      )
    }
    console.log('currentWalletStore', JSON.parse(JSON.stringify(currentWalletStore.assets)))
    console.log('tokenInfo', JSON.parse(JSON.stringify(tokenInfo.chains)))

    return (
      <Screen unsafe={true} style={styles.ROOT} preset="fixed">
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
                          onPress={() => switchChart(frame.value as number | "max")}
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
                          >
                            {frame.label}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  )}
                  {!!asset && !route.params.fromAddCurrency && (
                    <View>
                      <View style={styles.BALANCE_STAKING_CONTAINER}>
                        <View style={styles.BALANCE_STAKING_CARD}>
                          <View style={styles.BALANCE_STAKING_CARD_BODY}>
                            <Text style={styles.BALANCE_STAKING_CARD_HEADER}>
                              Available balance
                            </Text>
                            <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>
                              {+(Number(asset?.balance).toFixed(4))}
                            </Text>
                            <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                              {" "}
                              (~{`${(exchangeRates.getRate(asset.cid) * asset.balance).toFixed(2)}`}
                              $)
                            </Text>
                          </View>
                          {/* 
                          <View style={SEPARATOR} />
                          <Button style={styles.BALANCE_STAKING_CARD_BTN}>
                            <MaterialCommunityIcons
                              style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                              size={18}
                              name="swap-vertical-circle-outline"
                            />
                            <Text style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>SWAP</Text>
                          </Button> */}
                        </View>
                        <View style={styles.BALANCE_STAKING_CARD}>
                          <View style={styles.BALANCE_STAKING_CARD_BODY}>
                            <Text style={styles.BALANCE_STAKING_CARD_HEADER}> Staking balance</Text>
                            <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>{+(Number(0.45911).toFixed(4))}</Text>
                            <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                              Available rewards 0.02 (~1$)
                            </Text>
                          </View>
                          <View style={SEPARATOR} />
                          <Button style={styles.BALANCE_STAKING_CARD_BTN} onPress={navigateStakingBalance}>
                            <FontAwesome5Icon
                              size={18}
                              style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                              name="database"
                            />
                            <Text style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>MANAGE STAKING</Text>
                          </Button>
                        </View>
                      </View>

                      {pendingTransactions.getPendingTxsForAsset(asset).length > 0 && (
                        <View>
                          <View style={styles.TRANSACTIONS_HEADER}>
                            <Text preset="header" text="Pending transactions" />
                          </View>
                          <View style={styles.TRANSACTIONS_CONTAINER}>
                            {pendingTransactions.getPendingTxsForAsset(asset).map((tx, index) => (
                              <TransactionRow
                                key={index}
                                asset={asset}
                                transaction={{ ...tx, date: null, out: true, hash: "" }}
                              />
                            ))}
                          </View>
                        </View>
                      )}

                      {asset.chain !== "AVN" && (
                        <View>
                          <View style={styles.TRANSACTIONS_HEADER}>
                            <Text preset="header" text="Transactions" />
                          </View>
                          <View style={styles.TRANSACTIONS_CONTAINER}>
                            {transactions.map((tx, index) => (
                              <TransactionRow key={index} asset={asset} transaction={tx} />
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {!!tokenInfo && route.params.fromAddCurrency && (
                    <View style={styles.TOKEN_CHAINS_CONTAINER}>
                      {tokenInfo.chains.map((chain) => {
                        const hasInWallet = currentWalletStore.assets.find(
                          (item) => item.contract === chain.contract,
                        )

                        return (
                          <View style={styles.TOKEN_CHAIN_ROW} key={chain.id}>
                            <Text>{chain.name}</Text>
                            <Button
                              preset="secondary"
                              disabled={updatingWallet}
                              onPress={() => {
                                if (hasInWallet) {
                                  removeAsset(chain)
                                } else {
                                  addAsset(chain)
                                }
                              }}
                            >
                              {hasInWallet ? (
                                <Text
                                  style={styles.ADD_TO_PORTFOLIO_BTN}
                                  text={updatingWallet ? "Loading ..." : "Remove from portfolio"}
                                />
                              ) : (
                                <Text
                                  style={styles.ADD_TO_PORTFOLIO_BTN}
                                  text={updatingWallet ? "Loading ..." : "Add to portfolio"}
                                  />
                              )}
                            </Button>
                          </View>
                        )
                      })}
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
          onRightButtonPress={() => explorerUrl && openLink(explorerUrl)}
          rightButtonDisabled={!explorerUrl}
          onLeftButtonPress={goBack}
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
                {!!asset && (
                  <View style={styles.RECEIVE_MODAL_ADDRESS}>
                    <TextRn style={styles.RECEIVE_MODAL_ADDRESS_TEXT}>
                      {asset.address.match(/.{1,5}/g).map((e) => {
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
