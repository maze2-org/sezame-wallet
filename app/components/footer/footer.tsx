import * as React from "react"
import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"
import { SvgXml } from "react-native-svg"
import backIcon from "../../../assets/svg/back.svg"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  height: 66.5,
  backgroundColor: color.palette.black,
  width: "100%",
  alignItems: "center",
  display: "flex",
  flexDirection: "row",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

const IconStyle: ViewStyle = {
  marginRight: spacing[2]
}
export interface FooterProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Footer = observer(function Footer(props: FooterProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <TouchableOpacity style={styles}>
      <SvgXml width={24} height={24} xml={backIcon} style={IconStyle}/>
      <Text>Back</Text>
    </TouchableOpacity>
  )
})
