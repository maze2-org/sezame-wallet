import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle, Image, ImageStyle, Text as TextReact } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  display: "flex",
  flexDirection: "row",
  margin: 14,
  minHeight: 60,
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
  minHeight: 60,
  flexDirection: "column",
  display: "flex",
  justifyContent: "center",
}

const COIN_NAME: TextStyle = {
  fontSize: 16,
}
const COIN_AMOUNT: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  color: color.palette.white,
}

export interface CoinCardProps {
  style?: StyleProp<ViewStyle>
  imageUrl: string
  name?: string
  chain?: string
  balance?: number
}

/**
 * Describe your component here
 */
export const CoinCard = observer(function CoinCard(props: CoinCardProps) {
  const { style, imageUrl, name, chain, balance } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <View style={styles}>
      <Image style={COIN_IMAGE} source={{ uri: imageUrl }}></Image>
      <View style={COIN_CARD_CONTENT}>
        {!!chain && <Text text={chain} />}
        {!!name && <Text style={COIN_NAME} preset="header" text={name} />}
        {balance !== undefined && <TextReact style={COIN_AMOUNT}>{(Number(balance).toFixed(4))}</TextReact>}
      </View>
    </View>
  )
})
