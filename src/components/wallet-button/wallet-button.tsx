import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { Text } from "../text/text"
import { viewPresets, textPresets } from "./wallet-button.presets"
import { ButtonProps } from "./wallet-button.props"

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function WalletButton(props: ButtonProps) {
  // grab the props
  const {
    tx,
    disabled,
    text,
    style: styleOverride,
    textStyle: textStyleOverride,
    children,
    type = "primary",
    outline = false,
    ...rest
  } = props

  // const viewStyle = viewPresets[preset] || viewPresets.primary
  // const viewStyles = [viewStyle, styleOverride]
  // const textStyle = textPresets[preset] || textPresets.primary
  // const textStyles = [textStyle, textStyleOverride]

  let viewStyles = []
  let textStyles = []

  let chosenSyle = `${type}${outline ? "Outline" : "Normal"}${disabled ? "Disabled" : "Active"}`
  viewStyles.push(viewPresets[chosenSyle] || viewPresets.primaryNormal)
  textStyles.push(textPresets[chosenSyle] || textPresets.primaryNormal)

  if (textStyleOverride) {
    textStyles.push(textStyleOverride)
  }

  if (styleOverride) {
    viewStyles.push(styleOverride)
  }

  const content = children || <Text tx={tx} text={text} style={textStyles} />

  if (disabled) {
    return <View style={viewStyles}>{content}</View>
  }
  return (
    <TouchableOpacity style={viewStyles} {...rest}>
      {content}
    </TouchableOpacity>
  )
}
