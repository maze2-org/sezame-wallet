import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {showMessage} from 'react-native-flash-message';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {StackScreenProps} from '@react-navigation/stack';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {View, Animated, StyleSheet, ViewStyle} from 'react-native';

import CoinBox from '../../components/CoinBox/CoinBox';
import {NavigatorParamList} from '../../navigators';
import {chainSymbolsToNames} from 'utils/consts';
import {Text, Button, AppScreen} from '../../components';
import {color, spacing, typography} from '../../theme';
import {useStores} from '../../models';

const Fonts = [11, 15, 24, 48, 64];
const MY_STYLE = StyleSheet.create({
  common: {
    display: 'flex',
    flexDirection: 'row',
  },
});
const styles = StyleSheet.create({
  LOADING_BOX: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  NETWORK: {
    ...MY_STYLE.common,
    padding: spacing[2],
  },
  NETWORK_CONTAINER: {
    marginTop: spacing[3],
  },

  ORANGE_COLOR: {
    color: color.palette.gold,
    fontFamily: typography.primary,
    fontSize: Fonts[2],
    fontWeight: '600',
    marginTop: spacing[2],
  },
  PORTFOLIO: {
    color: color.palette.white,
    fontFamily: typography.primary,
    fontSize: Fonts[4],
    fontWeight: '600',
    maxWidth: 300,
  },
  PORTFOLIO_CONTAINER: {
    elevation: 2,
    marginTop: spacing[5],
    paddingVertical: spacing[6],
    zIndex: 2,
  },
  PORTFOLIO_DOLLAR: {
    alignSelf: 'flex-start',
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
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
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

  SORT_BTN_CONTAINER: {
    ...MY_STYLE.common,
  },
  SORT_BY: {
    color: color.palette.grey,
    fontSize: Fonts[0],
    fontWeight: '600',
  },
  SORT_CONTAINER: {
    elevation: 3,
    ...MY_STYLE.common,
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '600',
  },
  WALLET_NAME: {
    color: color.palette.gold,
    display: 'flex',
    fontFamily: typography.primary,
    textAlign: 'center',
  },
});

const SORT_TYPES = {
  NETWORK: 'NETWORK',
  CURRENCIES: 'CURRENCIES',
};

const SKELETON_WRAPPER: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 100,
  marginBottom: 13,
};
const SKELETON_ITEM: ViewStyle = {
  width: 60,
  height: 60,
  marginTop: 20,
  marginRight: 2,
  borderRadius: 50,
};
const SKELETON_LINE: ViewStyle = {
  width: 60,
  height: 5,
  borderRadius: 4,
  marginTop: 10,
};

type SortTypeKeys = keyof typeof SORT_TYPES;
type SortTypeValues = (typeof SORT_TYPES)[SortTypeKeys];

export const DashboardScreen: FC<
  StackScreenProps<NavigatorParamList, 'dashboard'>
> = observer(function DashboardScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const {currentWalletStore, exchangeRates, TESTNET} = useStores();
  const {wallet, assets, refreshBalances, loadingBalance, resetBalance} =
    currentWalletStore;
  const [sortBy, setSortBy] = useState<SortTypeValues>(SORT_TYPES.NETWORK);
  const [groups, setGroups] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (loadingBalance && isFocused) {
      showMessage({
        message: 'Loading...',
        type: 'success',
      });
    }
  }, [isFocused, loadingBalance]);

  // useEffect(() => {
  //   // Load balance and prepare the display of the assets when initializing the dashboard
  //   refreshBalances().then(() => {
  //     preparingAssets(sortBy)
  //   })
  // }, [assets])

  useEffect(() => {
    resetBalance();
    refreshBalances().then(() => {
      preparingAssets(sortBy);
    });
  }, [TESTNET]);

  useFocusEffect(
    // Refresh the list when dashaboard becomes active
    React.useCallback(() => {
      preparingAssets(sortBy);
    }, []),
  );

  const preparingAssets = (sortBy: SortTypeValues) => {
    const groups = {};
    assets.forEach(asset => {
      const data = {image: ''};
      if (sortBy === SORT_TYPES.NETWORK) {
        if (asset.chain) {
          if (Array.isArray(groups[asset.chain])) {
            groups[asset.chain].push({
              ...asset,
              image: data?.image || asset.image,
            });
          } else {
            groups[asset.chain] = [
              {...asset, image: data?.image || asset.image},
            ];
          }
        }
      } else {
        if (asset.name) {
          if (Array.isArray(groups[asset.name])) {
            groups[asset.name].push({
              ...asset,
              image: data?.image || asset.image,
            });
          } else {
            groups[asset.name] = [
              {...asset, image: data?.image || asset.image},
            ];
          }
        }
      }
    });

    const sortByFns = {
      [SORT_TYPES.NETWORK]: getSortedGroupsByNetwork,
      [SORT_TYPES.CURRENCIES]: getSortedGroupsByCurrency,
    };

    const sortedGroups = sortByFns[sortBy](groups);

    setGroups(sortedGroups);
  };

  const getSortedGroupsByNetwork = groups => {
    const sortedGroupNames = Object.keys(groups);
    sortedGroupNames.sort((a, b) => {
      const aName = chainSymbolsToNames[a];
      const bName = chainSymbolsToNames[b];
      return aName.toLowerCase() > bName.toLowerCase() ? 1 : -1;
    });
    const sortedGroups = {};
    sortedGroupNames.forEach(groupName => {
      if (!sortedGroups[groupName]) {
        sortedGroups[groupName] = [];
      }
      sortedGroups[groupName] = [...groups[groupName]];
    });
    return sortedGroups;
  };

  const getSortedGroupsByCurrency = groups => {
    const sortedGroupNames = Object.keys(groups);
    sortedGroupNames.sort((a, b) => {
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    });

    const sortedGroups = {};
    sortedGroupNames.forEach(groupName => {
      if (!sortedGroups[groupName]) {
        sortedGroups[groupName] = [];
      }
      sortedGroups[groupName] = groups[groupName].map(g => ({
        ...g,
        name: chainSymbolsToNames[g.chain],
      }));
    });
    return sortedGroups;
  };

  const changeSortType = useCallback((sortType: SortTypeValues) => {
    preparingAssets(sortType);
    setSortBy(sortType);
  }, []);

  const scale = scrollY.interpolate({
    inputRange: [50, 85],
    outputRange: [1, 0.4],
    extrapolate: 'clamp',
  });
  const top = scrollY.interpolate({
    inputRange: [50, 85],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });
  const opacity = scrollY.interpolate({
    inputRange: [50, 85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const point = 60;
  const translateY = scrollY.interpolate({
    inputRange: [0, point, point + 1],
    outputRange: [0, 0, 1],
  });
  const translateY2 = scrollY.interpolate({
    inputRange: [0, point + 30, point + 31],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.ScrollView
      style={styles.SCROLL_VIEW}
      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: true,
      })}
      scrollEventThrottle={16}>
      <AppScreen unsafe>
        <View style={styles.PORTFOLIO_WRAPPER}>
          {loadingBalance ? (
            <Animated.View
              style={[styles.PORTFOLIO_CONTAINER, {transform: [{translateY}]}]}>
              <Animated.View style={[styles.PORTFOLIO_OVERLAY, {opacity}]} />
              <SkeletonPlaceholder
                speed={1200}
                backgroundColor={color.palette.lightGrey}>
                <View style={SKELETON_WRAPPER}>
                  <View style={SKELETON_ITEM} />
                  <View style={SKELETON_LINE} />
                </View>
              </SkeletonPlaceholder>
            </Animated.View>
          ) : (
            <Animated.View
              style={[styles.PORTFOLIO_CONTAINER, {transform: [{translateY}]}]}>
              <Animated.View style={[styles.PORTFOLIO_OVERLAY, {opacity}]} />
              <Animated.View
                style={[styles.PORTFOLIO_VALUE, {transform: [{scale}]}]}>
                <Text
                  style={styles.PORTFOLIO}
                  adjustsFontSizeToFit
                  numberOfLines={1}>
                  {+Number(exchangeRates.getTotal(assets)).toFixed(2)}
                </Text>
                <Text style={styles.PORTFOLIO_DOLLAR}> $</Text>
              </Animated.View>
              {!!wallet && (
                <Animated.Text
                  style={[
                    styles.WALLET_NAME,
                    {transform: [{translateY: top}]},
                  ]}>
                  {JSON.parse(wallet).walletName.toUpperCase()}{' '}
                </Animated.Text>
              )}
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.SORT_CONTAINER,
              {transform: [{translateY: translateY2}]},
            ]}>
            <Animated.View style={[styles.SORT_OVERLAY, {opacity}]} />
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
                  changeSortType(SORT_TYPES.NETWORK);
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
                  changeSortType(SORT_TYPES.CURRENCIES);
                }}
              />
            </View>
          </Animated.View>
          <View style={styles.NETWORK_CONTAINER}>
            {Object.values(groups).map((assets, index) => {
              const title = Object.keys(groups)[index];
              const titleMap = {
                [SORT_TYPES.NETWORK]: chainSymbolsToNames[title],
                [SORT_TYPES.CURRENCIES]: title,
              };
              return (
                <CoinBox
                  key={titleMap[sortBy]}
                  assets={assets}
                  title={titleMap[sortBy]}
                />
              );
            })}
          </View>
        </View>
      </AppScreen>
    </Animated.ScrollView>
  );
});
