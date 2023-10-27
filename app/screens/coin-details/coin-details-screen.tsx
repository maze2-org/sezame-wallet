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
  Pressable,
} from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5"
import IonIcons from "react-native-vector-icons/Ionicons"
import copyImg from "../../../assets/svg/copy.svg"
import stakeIcon from "../../../assets/icons/stake.svg"
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
import AnimatedComponent from "../../components/animatedComponent/AnimatedComponent"

const tokens = require("../../config/tokens.json")

export const CoinDetailsScreen: FC<StackScreenProps<NavigatorParamList, "coinDetails">> = observer(
  function CoinDetailsScreen({ route }) {
    const modalFlashRef = useRef<FlashMessage>()
    const [receiveIsVisible, setReceiveIsVisible] = useState<boolean>(false)
    const [coinData, setCoinData] = useState<CoingeckoCoin | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [transactions, setTransactions] = useState<CryptoTransaction[]>([])
    const [chartDays, setChartDays] = useState<number | "max">(1)
    const {
      currentWalletStore,
      pendingTransactions,
      exchangeRates,
      setOverlayLoadingShown,
    } = useStores()
    const { getAssetById, getAssetsById, refreshBalances, updatingAssets } = currentWalletStore
    const [explorerUrl, setExplorerUrl] = useState<string>("")
    const [prevPndTsx, setPrevPndTsx] = useState(null)

    const pndTsx = pendingTransactions?.transactions
    const asset = getAssetById(route.params.coinId, route.params.chain)
    const allAssets = getAssetsById(route.params.coinId, route.params.chain)
    const tokenInfo = tokens.find((token) => token.id === route.params.coinId)

    const capabilities =
      tokenInfo.chains.reduce((previous, current) => {
        if (current.id === route.params.chain) {
          return current.capabilities
        }
        return previous
      }, []) || []

    const _getBalances = async () => {
      refreshBalances()
    }

    const _getTransactions = async () => {
      const tsx = await getTransactions(asset)
      setTransactions(tsx)
    }

    const updateTransactions = () => {
      const txList = pendingTransactions.getPendingTxsForAsset(asset)
      txList.forEach((tx) => {
        console.log("GET TX STATUS OF", tx)
        getTransactionStatus(asset, tx.txId)
          .then((status) => {
            pendingTransactions.update(tx, { status })

            if (status === "success") {
              pendingTransactions.remove(asset, tx)
              _getBalances()
              _getTransactions()
            }
          })
          .catch((err) => {
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

    // Every PendingTransaction Update check transaction status and show notification
    const showTsxMessage = ({ success, failed }) => {
      let type, message
      if (success === 1 && failed === 0) {
        message = "Your pending transaction has succeeded"
        type = "success"
      } else if (failed === 1 && success === 0) {
        message = "Your pending transaction has failed"
        type = "danger"
      } else if (success > 1 && failed === 0) {
        message = "Your pending transactions have succeeded"
        type = "success"
      } else if (failed > 1 && success === 0) {
        message = "Your pending transactions have failed"
        type = "danger"
      } else {
        message = "Your pending transactions status have changed"
        type = "success"
      }

      showMessage({ type, message })
    }

    useEffect(() => {
      const tsxStatuses = {}
      const statuses = { success: 0, failed: 0 }
      if (prevPndTsx) {
        if (Array.isArray(pendingTransactions?.transactions)) {
          pendingTransactions.transactions.forEach((tsx) => {
            if (tsx.status !== prevPndTsx[tsx.txId]) {
              if (["success"].includes(tsx.status)) {
                // success
                statuses.success = statuses.success + 1
              } else if (["failed"].includes(tsx.status)) {
                // failed
                statuses.failed = statuses.failed + 1
              }
            }
            tsxStatuses[tsx.txId] = tsx.status
          })
          showTsxMessage(statuses)
        }
      } else {
        pendingTransactions?.transactions?.forEach((tsx) => (tsxStatuses[tsx.txId] = tsx.status))
        setPrevPndTsx(tsxStatuses)
      }
    }, [pndTsx])

    const addAsset = React.useCallback((chain: any) => {
      currentWalletStore
        .addAutoAsset({
          name: tokenInfo.name,
          chain: chain.id,
          symbol: tokenInfo.symbol,
          cid: tokenInfo.id,
          type: tokenInfo.type,
          contract: chain.contract,
          image: tokenInfo.thumb,
        })
        .then(() => {
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
    }, [])

    useEffect(() => {
      if (updatingAssets) {
        setOverlayLoadingShown(true)
      } else {
        setOverlayLoadingShown(false)
      }
    }, [updatingAssets])

    const removeAsset = React.useCallback((chain: any) => {
      console.log(
        "REMOVEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEeE ASSET",
        chain.id,
        tokenInfo.symbol,
      )
      currentWalletStore
        .removeAsset(chain.id, tokenInfo.symbol)
        .then(() => {
          showMessage({
            message: "Coin removed from wallet",
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
    const goToSend = () =>
      navigation.navigate("send", { coinId: route.params.coinId, chain: route.params.chain })
    const toggleReceiveModal = (value: boolean) => {
      setReceiveIsVisible(value)
    }
    const goBack = () => navigation.goBack()
    const openLink = async (url) => {
      Linking.openURL(url)
    }

    const copyAddress = (value) => {
      if (value) {
        Clipboard.setString(value)
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
      navigation.navigate("stakingBalance", {
        image: coinData.image?.large,
        name: coinData?.name,
        asset: !!asset && !route.params.fromAddCurrency && asset,
      })
    }

    const navigateSwapping = () => {
      let swapType: "swap" | "lowering" | "lifting" = "swap"
      let swapToChain = ""
      let swapToToken = ""

      if (capabilities.includes("lowering")) {
        swapType = "lowering"
        const liftTo = tokenInfo.chains.find(
          (item) => item.capabilities && item.capabilities.includes("lifting"),
        )
        if (liftTo) {
          swapToChain = liftTo.id
          swapToToken = tokenInfo.id
        }
      } else if (capabilities.includes("lifting")) {
        swapType = "lifting"
        const lowerTo = tokenInfo.chains.find(
          (item) => item.capabilities && item.capabilities.includes("lowering"),
        )
        if (lowerTo) {
          swapToChain = lowerTo.id
          swapToToken = tokenInfo.id
        }
      }

      let navigationOptions = {
        chain: asset.chain,
        coinId: asset.cid,
        swapType,
        swapToChain,
        swapToToken,
      }

      // navigation.navigate("swap", navigationOptions)
    }

    return (
      <Screen unsafe={true} style={styles.ROOT} preset="fixed">
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <ScrollView>
            {!!coinData && (
              <View>
                <AnimatedComponent direction={"TOP"}>
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
                          <FontAwesome5Icon
                            name="arrow-down"
                            size={18}
                            color={color.palette.white}
                          />
                          <Text style={styles.VERTICAL_ICON_BTN_TEXT}>Receive</Text>
                        </Button>
                      </View>
                    )}
                  </View>
                  {!!chartData && !!chartData.length && (
                    <PriceChart data={chartData.map((p) => p[1])} />
                  )}
                </AnimatedComponent>
                <View style={styles.COIN_DETAILS_CONTAINER}>
                  <AnimatedComponent direction={"TOP"}>
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
                  </AnimatedComponent>
                  <AnimatedComponent direction={"BOTTOM"}>
                    {!!asset && !route.params.fromAddCurrency && (
                      <View>
                        <View style={styles.BALANCE_STAKING_CONTAINER}>
                          <View style={styles.BALANCE_STAKING_CARD}>
                            <View style={styles.BALANCE_STAKING_CARD_BODY}>
                              <Text style={styles.BALANCE_STAKING_CARD_HEADER}>
                                Available balance
                              </Text>
                              <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>
                                {Number(asset?.freeBalance).toFixed(4) +
                                  " " +
                                  asset.symbol.toUpperCase()}
                              </Text>
                              <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                                {" "}
                                (~
                                {`${(exchangeRates.getRate(asset.cid) * asset.freeBalance).toFixed(
                                  2,
                                )}`}
                                $)
                              </Text>
                            </View>
                            {["lifting", "lowering"].some((el) => capabilities.includes(el)) && (
                              <>
                                <View style={SEPARATOR} />
                                <Button
                                  style={styles.BALANCE_STAKING_CARD_BTN}
                                  onPress={navigateSwapping}
                                >
                                  <IonIcons
                                    style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                                    name="swap-horizontal"
                                    size={23}
                                  />
                                  <Text style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>SWAP</Text>
                                </Button>
                              </>
                            )}
                          </View>
                          {capabilities.includes("staking") && (
                            <View style={styles.BALANCE_STAKING_CARD}>
                              <View style={styles.BALANCE_STAKING_CARD_BODY}>
                                <Text style={styles.BALANCE_STAKING_CARD_HEADER}>
                                  Staked balance
                                </Text>
                                <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>
                                  {(
                                    asset.stakedBalance +
                                    asset.unlockedBalance +
                                    asset.unstakedBalance
                                  ).toFixed(4)}{" "}
                                  {asset.symbol.toUpperCase()}
                                </Text>
                                <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                                  (~
                                  {`${(
                                    exchangeRates.getRate(asset.cid) *
                                    (asset.stakedBalance +
                                      asset.unlockedBalance +
                                      asset.unstakedBalance)
                                  ).toFixed(2)}`}
                                  $)
                                </Text>
                                <View style={styles.BALANCE_STAKING_CARD_BODY_V_SPACING}>
                                  <Text
                                    style={styles.BALANCE_STAKING_LITTLE_TEXT}
                                  >{`Staked: ${asset.stakedBalance.toFixed(4)}`}</Text>
                                  <Text
                                    style={styles.BALANCE_STAKING_LITTLE_TEXT}
                                  >{`Unstaked: ${asset.unstakedBalance.toFixed(4)}`}</Text>
                                  <Text
                                    style={styles.BALANCE_STAKING_LITTLE_TEXT}
                                  >{`Unlocked: ${asset.unlockedBalance.toFixed(4)}`}</Text>
                                </View>
                              </View>

                              <>
                                <View style={SEPARATOR} />
                                <Button
                                  style={styles.BALANCE_STAKING_CARD_BTN}
                                  onPress={navigateStakingBalance}
                                >
                                  <SvgXml
                                    xml={stakeIcon}
                                    height={24}
                                    style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                                  />
                                  <Text style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>
                                    MANAGE STAKING
                                  </Text>
                                </Button>
                              </>
                            </View>
                          )}
                        </View>

                        {pendingTransactions.getPendingTxsForAsset(asset).length > 0 && (
                          <View>
                            <View style={styles.TRANSACTIONS_HEADER}>
                              <Text preset="header" text="Pending transactions" />
                            </View>
                            <View style={styles.TRANSACTIONS_CONTAINER}>
                              {pendingTransactions.getPendingTxsForAsset(asset).map((tx, index) => (
                                <>
                                  <TransactionRow
                                    key={tx.txId}
                                    asset={asset}
                                    onRemove={() => {
                                      pendingTransactions.remove(asset, tx)
                                    }}
                                    transaction={{ ...tx, date: null, out: true, hash: "" }}
                                  />
                                </>
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
                          const allChains = allAssets
                            ? allAssets.filter((a) => a.cid === asset.cid).map((a) => a.chain)
                            : []
                          const hasInWallet = currentWalletStore.assets.find((item) => {
                            return item.contract === chain.contract && item.chain === chain.id
                          })

                          const showRemoveBtnCondition =
                            asset && asset.cid === chain.name && allChains.includes(chain.id)

                          return (
                            <View style={styles.TOKEN_CHAIN_ROW} key={chain.id}>
                              <Text>{chain.name}</Text>
                              <Button
                                preset="secondary"
                                onPress={() => {
                                  if (!!hasInWallet || !!showRemoveBtnCondition) {
                                    removeAsset(chain)
                                  } else {
                                    addAsset(chain)
                                  }
                                }}
                              >
                                {!!hasInWallet || !!showRemoveBtnCondition ? (
                                  <Text
                                    style={styles.ADD_TO_PORTFOLIO_BTN}
                                    text={"Remove from portfolio"}
                                  />
                                ) : (
                                  <Text
                                    style={styles.ADD_TO_PORTFOLIO_BTN}
                                    text={"Add to portfolio"}
                                  />
                                )}
                              </Button>
                            </View>
                          )
                        })}
                      </View>
                    )}
                  </AnimatedComponent>
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
          <Pressable style={styles.RECEIVE_MODAL_WRAPPER} onPress={() => toggleReceiveModal(false)}>
            <Pressable style={styles.RECEIVE_MODAL_CONTAINER}>
              <View style={styles.RECEIVE_MODAL_CLOSE_WRAPPER}>
                <Pressable
                  style={styles.RECEIVE_MODAL_CLOSE}
                  hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                  onPress={() => toggleReceiveModal(false)}
                >
                  <IonIcons name={"close-outline"} size={30} color={color.palette.white} />
                </Pressable>
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

                <TouchableOpacity
                  style={styles.RECEIVE_MODAL_COPY_BUTTON}
                  onPress={() => copyAddress(asset?.address)}
                >
                  <View>
                    <SvgXml
                      stroke={color.palette.gold}
                      xml={copyImg}
                      height={20}
                      style={styles.COPY_ICON}
                    />
                    <Text style={styles.RECEIVE_MODAL_COPY_TEXT}>COPY ADDRESS</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.RECEIVE_MODAL_COPY_BUTTON}
                  onPress={() => copyAddress(asset?.publicKey)}
                >
                  <View>
                    <SvgXml
                      stroke={color.palette.gold}
                      xml={copyImg}
                      height={20}
                      style={styles.COPY_ICON}
                    />
                    <Text style={styles.RECEIVE_MODAL_COPY_TEXT}>COPY PUBLIC KEY</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
          <FlashMessage ref={modalFlashRef} position="bottom" />
        </Modal>
      </Screen>
    )
  },
)
