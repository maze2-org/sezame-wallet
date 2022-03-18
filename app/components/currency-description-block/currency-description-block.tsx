import * as React from "react"
import {
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import {
  AutoImage as Image,
} from "../../components"
import { SvgXml } from "react-native-svg"
const CONTAINER: ViewStyle = {
  justifyContent: "center",
  width: 81,
  height: 81,
  backgroundColor: color.palette.white,
  borderRadius: 9999,
  alignItems: "center",
  position: "relative"
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

const LogoStyle: ImageStyle = {
  width: 50.4,
  height: 50.4
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
  alignItems: "center"
}
export interface CurrencyDescriptionBlockProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>,

  logo?: ImageSourcePropType & ImageURISource,

  icon?: string
}

/**
 * Describe your component here
 */
export const CurrencyDescriptionBlock = observer(function CurrencyDescriptionBlock(props: CurrencyDescriptionBlockProps) {
  const { style, logo, icon } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <View style={styles}>
      <Image source={logo} style={LogoStyle}/>
      <View style={IconStyle}>
        <SvgXml width={24} height={24} xml={icon} />
      </View>
    </View>
  )
})
