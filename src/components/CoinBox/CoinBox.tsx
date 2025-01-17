import React, {useState, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import {IWalletAsset, useStores} from 'models';
import {color, spacing} from '../../theme';
import {NavigatorParamList} from '../../navigators';

const Fonts = [11, 15, 24, 48, 64];
const MY_STYLE = StyleSheet.create({
  common: {
    display: 'flex',
    flexDirection: 'row',
  },
});
const styles = StyleSheet.create({
  BOLD_FONT: {
    color: color.palette.white,
    fontSize: Fonts[1],
    fontWeight: 'bold',
  },
  COIN_BOX: {
    backgroundColor: color.palette.darkblack,
    borderRadius: 8,
    marginBottom: spacing[4],
    overflow: 'hidden',
    minHeight: 116,
  },
  COIN_BOX_BODY: {padding: spacing[4]},
  COIN_CARD: {
    ...MY_STYLE.common,
    alignItems: 'center',
    width: '100%',
  },
  COIN_CARD_CONTENT: {
    ...MY_STYLE.common,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  COIN_CARD_CONTENT_LEFT: {
    display: 'flex',
    flexDirection: 'column',
  },
  COIN_CARD_CONTENT_RIGHT: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
  },
  COIN_EXPAND_CONTAINER: {
    ...MY_STYLE.common,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  COIN_STAKE: {
    alignItems: 'center',
    backgroundColor: color.palette.black,
    borderRadius: 10,
    display: 'flex',
    height: 20,
    justifyContent: 'center',
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
  NETWORK_IMAGE: {
    height: '100%',
    width: '100%',
  },
  NETWORK_IMAGE_BORDER: {
    height: 50,
    width: 50,
    alignItems: 'center',
    backgroundColor: color.palette.lineColor,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  SEPARATOR: {
    borderBottomColor: color.palette.lightGrey,
    borderBottomWidth: 0.5,
  },
  SORT_BTN_CONTAINER: {
    ...MY_STYLE.common,
  },
  SKELETON_ITEM: {
    width: 60,
    height: 10,
    borderRadius: 4,
    marginBottom: 5,
  },
  SKELETON_WRAPPER: {
    alignItems: 'flex-end',
  },
  SKELETON_ITEM_TWO: {
    width: 50,
    height: 8,
    borderRadius: 4,
  },
});

const CoinBox = ({assets, title}) => {
  const {currentWalletStore} = useStores();
  const {loadingBalance} = currentWalletStore;
  const [isOpen, setIsOpen] = useState(true);
  const [disable, setDisable] = useState(false);
  const animCardBox = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // const changeIsOpen = () => {
  //   if (Array.isArray(assets) && assets.length <= 1) {
  //     setDisable(true)
  //   } else {
  //     setDisable(false)
  //     setIsOpen((prev) => !prev)
  //   }
  // }

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const openCoinBox = () => {
    setIsOpen(p => {
      if (assets.length < 2) {
        startShake();
      } else {
        Animated.timing(animCardBox, {
          toValue: p ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }

      return !p;
    });
  };

  const height = animCardBox.interpolate({
    inputRange: [0, 1],
    outputRange: [assets.length * 82 + 33, 115],
  });

  const rotate = animCardBox.interpolate({
    inputRange: [0, 1],
    outputRange: ['-180deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.COIN_BOX, {height}]}>
      <TouchableOpacity
        style={styles.COIN_EXPAND_CONTAINER}
        activeOpacity={0.9}
        onPress={openCoinBox}>
        <Text
          style={{
            color: disable ? color.palette.lightGrey : color.palette.white,
          }}>
          {title}
        </Text>
        <Animated.View style={{transform: [{rotate}, {translateX: shakeAnim}]}}>
          <FontAwesomeIcon name={'chevron-down'} color={color.palette.white} />
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.SEPARATOR} />

      {assets.map((asset, idx) => {
        return (
          <CoinBoxItem
            key={idx}
            asset={asset}
            loadingBalance={loadingBalance}
          />
        );
      })}
    </Animated.View>
  );
};

export default CoinBox;

const CoinBoxItem = ({
  asset,
  loadingBalance,
}: {
  asset: IWalletAsset;
  loadingBalance: boolean;
}) => {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
  const {exchangeRates} = useStores();

  return (
    <View style={styles.COIN_BOX_BODY}>
      <TouchableOpacity
        style={styles.COIN_CARD}
        onPress={() =>
          navigation.navigate('coinDetails', {
            coinId: asset.cid,
            chain: asset.chain,
          })
        }>
        <View style={styles.NETWORK_IMAGE_BORDER}>
          {!!asset.image && (
            <Image style={styles.NETWORK_IMAGE} source={{uri: asset.image}} />
          )}
        </View>
        <View style={styles.COIN_CARD_CONTENT}>
          <View style={styles.COIN_CARD_CONTENT_LEFT}>
            <View style={styles.SORT_BTN_CONTAINER}>
              <Text style={styles.BOLD_FONT}>{asset.name}</Text>
            </View>
            {!asset.contract && (
              <Text style={styles.LIGHT_FONT}>{'Base currency'}</Text>
            )}
          </View>
          <View style={styles.COIN_CARD_CONTENT_RIGHT}>
            {loadingBalance ? (
              <SkeletonPlaceholder
                speed={1200}
                backgroundColor={color.palette.lightGrey}>
                <View style={styles.SKELETON_ITEM} />
                <View style={styles.SKELETON_WRAPPER}>
                  <View style={styles.SKELETON_ITEM_TWO} />
                </View>
              </SkeletonPlaceholder>
            ) : (
              <>
                <Text style={styles.BOLD_FONT}>
                  {Number(asset?.balanceWithDerivedAddresses).toFixed(4)}
                </Text>
                <Text style={styles.LIGHT_FONT}>
                  {`${(exchangeRates.getRate(asset?.cid) * asset.balanceWithDerivedAddresses).toFixed(2)}$`}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
