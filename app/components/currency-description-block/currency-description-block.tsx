import * as React from "react"
import {
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { AutoImage as Image, WalletButton } from "../../components"
import { SvgXml } from "react-native-svg"
import { IWalletAsset } from "models"

import transfer from "../../../assets/svg/transfer.svg"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  width: 81,
  height: 81,
  backgroundColor: color.palette.white,
  borderRadius: 9999,
  alignItems: "center",
  position: "relative",
}

const LogoStyle: ImageStyle = {
  width: 50.4,
  height: 50.4,
}

const IconStyle: ImageStyle = {
  backgroundColor: color.palette.gold,
  width: 38.8,
  height: 38.8,
  borderWidth: 3,
  borderColor: color.palette.black,
  position: "absolute",
  borderRadius: 9999,
  right: -10,
  top: 50,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}
export interface CurrencyDescriptionBlockProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  asset?: IWalletAsset
  title?: string
  icon?: "transfer" | "stack"
}

/**
 * Describe your component here
 */
export const CurrencyDescriptionBlock = observer(function CurrencyDescriptionBlock(
  props: CurrencyDescriptionBlockProps,
) {
  const { style, asset, icon, title } = props
  const styles = Object.assign({}, CONTAINER, style)

  const rewardsStyle: TextStyle = {
    color: color.palette.gold,
    fontSize: 10,
    lineHeight: 14,
    paddingVertical: spacing[2],
  }
  const amountStyle: TextStyle = {
    color: color.palette.white,
    fontSize: 27,
    lineHeight: 37,
  }

  return (
    <View style={{ alignItems: "center" }}>
      <View style={styles}>
        <Image source={{ uri: asset.image }} style={LogoStyle} />
        {icon === "transfer" && (
          <View style={IconStyle}>
            <SvgXml width={24} height={24} xml={transfer} />
          </View>
        )}
      </View>
      <Text style={rewardsStyle}>{title}</Text>
      <Text style={amountStyle}>
        {asset.balance} {asset.symbol}
      </Text>
    </View>
  )
})
