import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle, Image, ImageStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  display: "flex",
  flexDirection: "row",
  margin: 14,
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 12,
  color: color.primary,
}

const COIN_IMAGE: ImageStyle = {
  margin: spacing[1],
  resizeMode: "contain",
  display: "flex",
  width: 60,
}

const COIN_CARD_CONTENT: ViewStyle = {
  flex: 2,
}

const COIN_NAME: TextStyle = {
  fontSize: 16,
}
const COIN_AMOUNT: TextStyle = {
  fontSize: 16,
}
export interface CoinCardProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  imageUrl: string
  name: string
  chain: string
  balance?: number
  symbol: string
}

/**
 * Describe your component here
 */
export const CoinCard = observer(function CoinCard(props: CoinCardProps) {
  const { style, imageUrl, name, chain, balance, symbol } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <View style={styles}>
      <Image style={COIN_IMAGE} source={{ uri: imageUrl }}></Image>
      <View style={COIN_CARD_CONTENT}>
        <Text text={chain} />
        <Text style={COIN_NAME} preset="header" text={name} />
        <Text style={COIN_AMOUNT} preset="header" text={balance + " " + symbol} />
      </View>
    </View>
  )
})
