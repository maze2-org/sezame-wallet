import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle, Image, ImageStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  display: "flex",
  flexDirection: "row",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

const COIN_IMAGE: ImageStyle = {
  width: 50,
  height: 50,
  margin: spacing[2],
  flex: 1,
}

const COIN_CARD_CONTENT: ViewStyle = {
  flex: 2,
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
        <Text preset="header" text={name} />
        <Text preset="header" text={balance + " " + symbol} />
      </View>
    </View>
  )
})
