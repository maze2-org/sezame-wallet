import React, { useMemo, FC, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, ImageBackground, ScrollView, Linking } from 'react-native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import IonIcons from 'react-native-vector-icons/Ionicons';

import stakeIcon from '@assets/icons/stake.svg';
import { NavigatorParamList } from 'navigators';
import { showMessage } from 'react-native-flash-message';
import { Button, CoinCard, PriceChart, Screen, Text } from 'components';

import { color, spacing } from 'theme';
import { useNavigation } from '@react-navigation/native';
import { getCoinDetails, getMarketChart } from 'utils/apis';
import { CoingeckoCoin } from 'types/coingeckoCoin';
import { useStores } from 'models';
import { BackgroundStyle, MainBackground, SEPARATOR } from 'theme/elements';
import styles from './styles';
import { SvgXml } from 'react-native-svg';
import { getBalance, getTransactionsUrl } from 'services/api';
import AnimatedComponent from '../../components/animatedComponent/AnimatedComponent';
import CoinDetailsFooter from './compnents/coin-details-footer';
import ReceiveModal from './compnents/receive-modal';
import TransactionsHistory from './compnents/transactions-history';
import { BridgeCard } from 'components/bridge-card/bridge-card.component';
import { Card } from 'components/card/card.component';
const tokens = require('@config/tokens.json');

export const CoinDetailsScreen: FC<
  StackScreenProps<NavigatorParamList, 'coinDetails'>
> = observer(function CoinDetailsScreen({ route }) {
  const [receiveIsVisible, setReceiveIsVisible] = useState<boolean>(false);
  const [coinData, setCoinData] = useState<Partial<CoingeckoCoin> | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartDataError, setChartDataError] = useState<boolean>(false);
  const [chartDays, setChartDays] = useState<number | 'max'>(1);
  const { currentWalletStore, exchangeRates, setOverlayLoadingShown } =
    useStores();
  const {
    getAssetById,
    getSelectedAddressForAsset,
    getAssetsById,
    updatingAssets,
    setBalance,
  } = currentWalletStore;
  const [explorerUrl, setExplorerUrl] = useState<string>('');

  const asset = getSelectedAddressForAsset(
    route.params.coinId,
    route.params.chain,
  );
  const mainAsset = getAssetById(route.params.coinId, route.params.chain);
  const selectedAsset = getSelectedAddressForAsset(
    route.params.coinId,
    route.params.chain,
  );

  const allAssets = getAssetsById(route.params.coinId, route.params.chain);
  const tokenInfo = tokens.find(
    (token: any) => token.id === route.params.coinId,
  );

  const capabilities =
    tokenInfo.chains.reduce((previous, current) => {
      if (current.id === route.params.chain) {
        return current.capabilities;
      }
      return previous;
    }, []) || [];

  const updateChart = () => {
    getChartData();
  };

  useEffect(() => {
    const _getBalances = async () => {
      if (asset) {
        const balance = await getBalance(asset);
        setBalance(asset, balance);
      }
    };
    _getBalances();
  }, []);

  useEffect(() => {
    // Get graph data once then once every 60secs
    updateChart();
    getCoinData(route?.params?.coinId);
    if (mainAsset) {
      setExplorerUrl(getTransactionsUrl(mainAsset));
    }
  }, []);

  // Handle the graph duration selector
  React.useEffect(() => {
    getChartData();

    const intervalChart = setInterval(updateChart, 60000);
    return () => {
      clearInterval(intervalChart);
    };
  }, [chartDays]);

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
          message: 'Coin added to wallet',
          type: 'success',
        });
      })
      .catch(e => {
        console.log(e);
        showMessage({
          message: 'Something went wrong',
          type: 'danger',
        });
      });
  }, []);

  useEffect(() => {
    if (updatingAssets) {
      setOverlayLoadingShown(true);
    } else {
      setOverlayLoadingShown(false);
    }
  }, [updatingAssets]);

  const removeAsset = React.useCallback((chain: any) => {
    currentWalletStore
      .removeAsset(chain.id, tokenInfo.symbol)
      .then(() => {
        showMessage({
          message: 'Coin removed from wallet',
          type: 'success',
        });
      })
      .catch(e => {
        console.log(e);
        showMessage({
          message: 'Something went wrong',
          type: 'danger',
        });
      });
  }, []);

  const getCoinData = async (coinName: string) => {
    try {
      const data = await getCoinDetails(coinName);
      setCoinData(data);
    } catch (error: any) {
      showMessage({
        message: error?.message || 'Something went wrong',
        type: 'danger',
      });
      console.log('error Getting coin data', error);
    }
  };

  const getChartData = async () => {
    try {
      // setChartDays(days)
      const data = await getMarketChart(route?.params?.coinId, chartDays);

      setChartData(data.prices);
      setChartDataError(false);
    } catch (error) {
      console.log(error);
      setChartDataError(true);
    }
  };

  // Pull in navigation via hook
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const goToSend = () =>
    navigation.navigate('send', {
      coinId: route.params.coinId,
      chain: `${route.params.chain}`,
    });
  const toggleReceiveModal = (value: boolean) => {
    setReceiveIsVisible(value);
  };
  const goBack = () => navigation.goBack();

  const switchChart = (type: number | 'max') => {
    setChartDays(type);
  };

  const navigateStakingBalance = () => {
    if (coinData && mainAsset) {
      const assetRedirection =
        !!mainAsset && !route.params.fromAddCurrency && mainAsset;
      if (assetRedirection) {
        navigation.navigate('stakingBalance', {
          image: coinData?.image?.large,
          name: coinData?.name,
          asset: assetRedirection,
        });
      }
    }
  };

  const navigateSwapping = () => {
    let swapType: 'swap' | 'lowering' | 'lifting' = 'swap';
    let swapToChain = '';
    let swapToToken = '';

    if (capabilities.includes('lowering')) {
      swapType = 'lowering';
      const liftTo = tokenInfo.chains.find(
        (item: any) =>
          item.capabilities && item.capabilities.includes('lifting'),
      );
      if (liftTo) {
        swapToChain = liftTo.id;
        swapToToken = tokenInfo.id;
      }
    } else if (capabilities.includes('lifting')) {
      swapType = 'lifting';
      const lowerTo = tokenInfo.chains.find(
        (item: any) =>
          item.capabilities && item.capabilities.includes('lowering'),
      );
      if (lowerTo) {
        swapToChain = lowerTo.id;
        swapToToken = tokenInfo.id;
      }
    }
  };

  return (
    <Screen unsafe={true} style={styles.ROOT} preset="fixed">
      <ImageBackground source={MainBackground} style={BackgroundStyle}>
        <ScrollView>
          {!!coinData && (
            <View>
              <AnimatedComponent direction={'TOP'}>
                <View style={styles.COIN_CARD_CONTAINER}>
                  <CoinCard
                    style={styles.COIN_CARD}
                    name={coinData.name}
                    balance={asset?.balance}
                    imageUrl={coinData.image?.large}
                    symbol={coinData.symbol}
                    chain={`${mainAsset?.chain}`}
                  />
                  {!!mainAsset && (
                    <View style={styles.BTNS_CONTAINER}>
                      <Button
                        style={styles.VERTICAL_ICON_BTN}
                        onPress={goToSend}>
                        <FontAwesome5Icon
                          name="arrow-up"
                          size={18}
                          color={color.palette.white}
                        />
                        <Text style={styles.VERTICAL_ICON_BTN_TEXT}>Send</Text>
                      </Button>
                      <Button
                        style={styles.VERTICAL_ICON_BTN}
                        onPress={() => toggleReceiveModal(true)}>
                        <FontAwesome5Icon
                          name="arrow-down"
                          size={18}
                          color={color.palette.white}
                        />
                        <Text style={styles.VERTICAL_ICON_BTN_TEXT}>
                          Receive
                        </Text>
                      </Button>
                    </View>
                  )}
                </View>
                {!!chartDataError && !chartData && <Card title="Error with historcal data">
                  <View style={{ paddingTop: spacing[4] }}>
                    <Text>
                      Unable to retrieve historical data. Please refresh to display the graph.
                    </Text>
                  </View>
                </Card>}
                {!!chartData && !!chartData.length && (
                  <PriceChart data={chartData.map(p => p[1])} />
                )}
              </AnimatedComponent>
              <View style={styles.COIN_DETAILS_CONTAINER}>
                <AnimatedComponent direction={'TOP'}>
                  {!!chartData && !!chartData.length && (
                    <View style={styles.TIMEFRAME_BTNS}>
                      {[
                        { value: 1, label: '24H' },
                        { value: 7, label: '7D' },
                        { value: 30, label: '1M' },
                        { value: 90, label: '3M' },
                        { value: 180, label: '6M' },
                        { value: 'max', label: 'max' },
                      ].map(frame => (
                        <Button
                          key={frame.value}
                          onPress={() =>
                            switchChart(frame.value as number | 'max')
                          }
                          style={
                            chartDays === frame.value
                              ? styles.TIMEFRAME_BTN_ACTIVE
                              : styles.TIMEFRAME_BTN
                          }>
                          <Text
                            style={
                              chartDays === frame.value
                                ? styles.TIMEFRAME_BTN_TEXT_ACTIVE
                                : styles.TIMEFRAME_BTN_TEXT
                            }>
                            {frame.label}
                          </Text>
                        </Button>
                      ))}
                    </View>
                  )}
                </AnimatedComponent>
                <AnimatedComponent direction={'BOTTOM'}>
                  {!!mainAsset && !route.params.fromAddCurrency && (
                    <View>
                      <View style={styles.BALANCE_STAKING_CONTAINER}>
                        <View style={styles.BALANCE_STAKING_CARD}>
                          <View style={styles.BALANCE_STAKING_CARD_BODY}>
                            <Text style={styles.BALANCE_STAKING_CARD_HEADER}>
                              Available balance
                            </Text>
                            <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>
                              {Number(mainAsset?.freeBalance).toFixed(4) +
                                ' ' +
                                mainAsset.symbol.toUpperCase()}
                            </Text>
                            <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                              {' '}
                              (~
                              {`${(
                                exchangeRates.getRate(mainAsset.cid) *
                                mainAsset.freeBalance
                              ).toFixed(2)}`}
                              $)
                            </Text>
                          </View>
                          {['lifting', 'lowering'].some(el =>
                            capabilities.includes(el),
                          ) && (
                              <>
                                <View style={SEPARATOR} />
                                <Button
                                  style={styles.BALANCE_STAKING_CARD_BTN}
                                  onPress={navigateSwapping}>
                                  <IonIcons
                                    style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                                    name="swap-horizontal"
                                    size={23}
                                  />
                                  <Text
                                    style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>
                                    SWAP
                                  </Text>
                                </Button>
                              </>
                            )}
                        </View>

                        {capabilities.includes('staking') && (
                          <View style={styles.BALANCE_STAKING_CARD}>
                            <View style={styles.BALANCE_STAKING_CARD_BODY}>
                              <Text style={styles.BALANCE_STAKING_CARD_HEADER}>
                                Staked balance
                              </Text>
                              <Text style={styles.BALANCE_STAKING_CARD_AMOUNT}>
                                {(
                                  mainAsset.stakedBalance +
                                  mainAsset.unlockedBalance +
                                  mainAsset.unstakedBalance
                                ).toFixed(4)}{' '}
                                {mainAsset.symbol.toUpperCase()}
                              </Text>
                              <Text style={styles.BALANCE_STAKING_CARD_NOTE}>
                                (~
                                {`${(
                                  exchangeRates.getRate(mainAsset.cid) *
                                  (mainAsset.stakedBalance +
                                    mainAsset.unlockedBalance +
                                    mainAsset.unstakedBalance)
                                ).toFixed(2)}`}
                                $)
                              </Text>
                              <View
                                style={
                                  styles.BALANCE_STAKING_CARD_BODY_V_SPACING
                                }>
                                <Text
                                  style={
                                    styles.BALANCE_STAKING_LITTLE_TEXT
                                  }>{`Staked: ${mainAsset.stakedBalance.toFixed(
                                    4,
                                  )}`}</Text>
                                <Text
                                  style={
                                    styles.BALANCE_STAKING_LITTLE_TEXT
                                  }>{`Unstaked: ${mainAsset.unstakedBalance.toFixed(
                                    4,
                                  )}`}</Text>
                                <Text
                                  style={
                                    styles.BALANCE_STAKING_LITTLE_TEXT
                                  }>{`Unlocked: ${mainAsset.unlockedBalance.toFixed(
                                    4,
                                  )}`}</Text>
                              </View>
                            </View>

                            <>
                              <View style={SEPARATOR} />
                              <Button
                                style={styles.BALANCE_STAKING_CARD_BTN}
                                onPress={navigateStakingBalance}>
                                <SvgXml
                                  xml={stakeIcon}
                                  height={24}
                                  style={styles.BALANCE_STAKING_CARD_BTN_ICON}
                                />
                                <Text
                                  style={styles.BALANCE_STAKING_CARD_BTN_TEXT}>
                                  MANAGE STAKING
                                </Text>
                              </Button>
                            </>
                          </View>
                        )}
                      </View>
                      {selectedAsset && selectedAsset.chain === "ALPH" && (
                        <>
                          <BridgeCard from={selectedAsset} />
                          <TransactionsHistory asset={selectedAsset} />
                        </>
                      )}
                    </View>
                  )}

                  {!!tokenInfo && route.params.fromAddCurrency && (
                    <View style={styles.TOKEN_CHAINS_CONTAINER}>
                      {tokenInfo.chains.map(chain => {
                        const allChains = allAssets
                          ? allAssets
                            .filter(a => a.cid === mainAsset.cid)
                            .map(a => a.chain)
                          : [];
                        const hasInWallet = currentWalletStore.assets.find(
                          item => {
                            return (
                              item.contract === chain.contract &&
                              item.chain === chain.id
                            );
                          },
                        );

                        const showRemoveBtnCondition =
                          mainAsset &&
                          mainAsset.cid === chain.name &&
                          allChains.includes(chain.id);

                        return (
                          <View style={styles.TOKEN_CHAIN_ROW} key={chain.id}>
                            <Text>{chain.name}</Text>
                            <Button
                              preset="secondary"
                              onPress={() => {
                                if (!!hasInWallet || !!showRemoveBtnCondition) {
                                  removeAsset(chain);
                                } else {
                                  addAsset(chain);
                                }
                              }}>
                              {!!hasInWallet || !!showRemoveBtnCondition ? (
                                <Text
                                  style={styles.ADD_TO_PORTFOLIO_BTN}
                                  text={'Remove from portfolio'}
                                />
                              ) : (
                                <Text
                                  style={styles.ADD_TO_PORTFOLIO_BTN}
                                  text={'Add to portfolio'}
                                />
                              )}
                            </Button>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </AnimatedComponent>
              </View>
            </View>
          )}
        </ScrollView>
      </ImageBackground>

      {selectedAsset && (
        <CoinDetailsFooter
          asset={selectedAsset}
          explorerUrl={explorerUrl}
          onClickBack={goBack}
        />
      )}

      {selectedAsset && (
        <ReceiveModal
          asset={selectedAsset}
          visible={receiveIsVisible}
          onClose={() => toggleReceiveModal(false)}
        />
      )}
    </Screen>
  );
});
