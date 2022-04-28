import React from "react"
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"

import styles from "./styles"
import IonIcons from "react-native-vector-icons/Ionicons"
import icon_stack from "../../../assets/svg/stake.svg"
import icon_unStake from "../../../assets/svg/unstake.svg"
import { SvgXml } from "react-native-svg"
import { Footer, Screen } from "../../components"
import { IWalletAsset, useStores } from "../../models"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { chainSymbolsToNames } from "../../utils/consts"
import { showMessage } from "react-native-flash-message"
import { makeWithdrawal } from "services/api"

export interface StackingBalanceRouteParams {
  image: string
  name: string
  asset: IWalletAsset
}

export interface StackingBalanceProps {
  route: {
    params: StackingBalanceRouteParams
  }

  navigation: NativeStackNavigationProp<any>
}

const StakingBalance = (props: StackingBalanceProps) => {
  const {
    navigation,
    route: {
      params: { image, name, asset },
    },
  } = props
  const { exchangeRates, pendingTransactions, setOverlayLoadingShown } = useStores()

  const pressStackIcon = () => {
    navigation.navigate("stake", {
      chain: asset.chain,
      coinId: asset.cid,
    })
    console.log("Stack", asset)
  }

  const pressUnsStakeIcon = () => {
    navigation.navigate("unstake", {
      chain: asset.chain,
      coinId: asset.cid,
    })
  }

  const pressWithdrawButton = async () => {
    try {
      setOverlayLoadingShown(true)
      const txId = await makeWithdrawal(asset)
      if (!txId) {
        showMessage({ message: "Unable to withdraw", type: "danger" })
      } else {
        showMessage({
          message: "Withdrawal initiated",
          type: "success",
        })
        pendingTransactions.add(asset, {
          amount: asset.unlockedBalance.toFixed(4),
          from: asset.address,
          to: asset.address,
          timestamp: new Date().getTime(),
          reason: "withdraw",
          txId,
        })
        navigation.goBack()
      }
    } catch (err) {
      showMessage({ message: err.message, type: "danger" })
    } finally {
      setOverlayLoadingShown(false)
    }
  }

  return (
    <Screen unsafe={true} style={styles.ROOT} preset="fixed">
      <ScrollView style={styles.SCROLL_VIEW} contentContainerStyle={styles.SCROLL_VIEW_CONTAINER}>
        <View style={styles.HEADER}>
          <Text style={styles.BOLD_TEXT}>{name}</Text>
          <View style={styles.IMG_CONTAINER}>
            <Image source={{ uri: image }} width={100} height={100} style={styles.IMG} />
          </View>
          <Text style={styles.BIG_TEXT}>
            {asset.balance} {asset.symbol}
          </Text>
          <Text style={styles.GOLD_TEXT}>{chainSymbolsToNames[asset.chain]}</Text>
        </View>

        <View style={styles.BODY}>
          <View style={styles.CARD}>
            <View>
              <Text style={styles.GOLD_TEXT}>Available Balance</Text>
              <Text style={styles.MIDDLE_TEXT}>{asset?.freeBalance.toFixed(4)}</Text>
              <Text style={styles.TEXT}>
                (~{`${(exchangeRates.getRate(asset.cid) * asset.freeBalance).toFixed(2)}`}$)
              </Text>
            </View>

            <View>
              <View style={styles.ICON_CONTAINER}>
                <TouchableOpacity
                  onPress={pressStackIcon}
                  activeOpacity={0.7}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <SvgXml width={24} height={24} xml={icon_stack} />
                </TouchableOpacity>
                <Text style={styles.TEXT}>Stake</Text>
              </View>
            </View>
          </View>

          <View style={[styles.CARD, asset.stakedBalance <= 0 && styles.DISABLED]}>
            <View>
              <Text style={styles.GOLD_TEXT}>Staking balance</Text>
              <Text style={styles.MIDDLE_TEXT}>{asset.stakedBalance.toFixed(4)}</Text>
              <Text style={styles.TEXT}>
                (~
                {`${(exchangeRates.getRate(asset.cid) * asset.stakedBalance).toFixed(2)}`}
                $)
              </Text>
            </View>
            <View style={styles.ROW_ALIGN}>
              <View style={[styles.ICON_CONTAINER]}>
                {asset.stakedBalance > 0 ? (
                  <>
                    <TouchableOpacity
                      onPress={pressUnsStakeIcon}
                      activeOpacity={0.7}
                      hitSlop={{ top: 15, bottom: 15, left: 10, right: 15 }}
                    >
                      <SvgXml width={24} height={24} xml={icon_unStake} />
                    </TouchableOpacity>
                    <Text style={styles.TEXT}>Unstake</Text>
                  </>
                ) : (
                  <>
                    <SvgXml width={24} height={24} xml={icon_unStake} />
                    <Text style={styles.TEXT}>Unstake</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={[styles.CARD, asset.unlockedBalance <= 0 && styles.DISABLED]}>
            <View>
              <Text style={styles.GOLD_TEXT}>Unlocked balance</Text>
              <Text style={styles.MIDDLE_TEXT}>{asset.unlockedBalance.toFixed(4)}</Text>
              <Text style={styles.TEXT}>
                (~
                {`${(exchangeRates.getRate(asset.cid) * asset.unlockedBalance).toFixed(2)}`}
                $)
              </Text>
            </View>
            <View style={styles.ROW_ALIGN}>
              <View style={[styles.ICON_CONTAINER]}>
                {asset.unlockedBalance > 0 ? (
                  <>
                    <TouchableOpacity
                      onPress={pressWithdrawButton}
                      activeOpacity={0.7}
                      hitSlop={{ top: 15, bottom: 15, left: 10, right: 15 }}
                    >
                      <SvgXml width={24} height={24} xml={icon_unStake} />
                    </TouchableOpacity>
                    <Text style={styles.TEXT}>Withdraw</Text>
                  </>
                ) : (
                  <>
                    <SvgXml width={24} height={24} xml={icon_unStake} />
                    <Text style={styles.TEXT}>Withdraw</Text>
                  </>
                )}
              </View>
            </View>
          </View>
          <View style={[styles.CARD]}>
            <View>
              <Text style={styles.GOLD_TEXT}>Locked</Text>
              <Text style={styles.INFORMATOIN_TEXT}>
                Unstaked funds are automatically unlocked after 7 days.
              </Text>
              <Text style={styles.MIDDLE_TEXT}>{asset.unstakedBalance.toFixed(4)}</Text>
              <Text style={styles.TEXT}>
                (~
                {`${(exchangeRates.getRate(asset.cid) * asset.unstakedBalance).toFixed(2)}`}
                $)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer
        RightButtonIcon={(props) => <IonIcons {...props} name="globe-outline" size={23} />}
        onLeftButtonPress={() => navigation.goBack()}
      />
    </Screen>
  )
}

export default StakingBalance
