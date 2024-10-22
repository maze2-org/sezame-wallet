import React from "react"
import { StyleSheet, View, Text } from "react-native"
import { IWalletAsset } from "models"
import { AutoImage as Image } from "components"
import { LogoStyle } from "theme/elements.ts"
import { color, spacing } from "theme"
import { SvgXml } from "react-native-svg"
import arrowDown from "@assets/icons/arrow-down.svg"
import { palette } from "theme/palette.ts"

interface IRedeemCoins {
  from: IWalletAsset
  to: IWalletAsset
  bridging: any
}

const RedeemCoins: React.FC<IRedeemCoins> = ({ from, to, bridging }) => {
  return (
    <View style={styles.wrapper}>
      {bridging &&
        <Text style={styles.bridging}>Bridging&nbsp;{bridging} {from?.symbol?.toUpperCase()}</Text>
      }
      <View style={styles.block}>
        <View style={styles.cycle}>
          <Image source={{ uri: from.image }} style={styles.image} width={180} height={37} resizeMode={"contain"} />
        </View>
        <View style={styles.textsWrapper}>
          <Text style={styles.description}>Current balance on {from?.name} Network</Text>
          <Text style={styles.balance}>{from?.balance?.toFixed(4)} {from?.symbol?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.iconWrapper}>
        <SvgXml width={40} height={40} xml={arrowDown} />
      </View>
      <View style={styles.block}>
        <View style={styles.cycle}>
          <Image source={{ uri: to.image }} style={styles.image} width={180} height={37} resizeMode={"contain"} />
        </View>
        <View style={styles.textsWrapper}>
          <Text style={styles.description}>Current balance on {to?.name} Network</Text>
          <Text style={styles.balance}>{to?.balance?.toFixed(4)} {to?.symbol?.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  )
}

export default RedeemCoins

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  bridging: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
    color: palette.white,
  },
  block: {
    gap: 8,
    flexDirection: "row",
  },
  cycle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
    backgroundColor: color.palette.white,
  },
  textsWrapper: {
    gap: 4,
    justifyContent: "center",
  },
  description: {
    fontSize: 10,
    color: "#DBAF00",
  },
  balance: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.white,
  },
  image: {
    height: 37,
    width: 180,
    maxWidth: "100%",
    alignSelf: "center",
    marginVertical: spacing[5],
  },
  iconWrapper: {
    width: 49,
    alignItems: "center",
    justifyContent: "center",
  },
})
