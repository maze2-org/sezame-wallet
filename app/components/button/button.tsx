import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { btnDisabled } from "theme/elements"
import { Text } from "../text/text"
import { viewPresets, textPresets } from "./button.presets"
import { ButtonProps } from "./button.props"

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Button(props: ButtonProps) {
  // grab the props
  const {
    preset = "primary",
    tx,
    disabled,
    text,
    style: styleOverride,
    textStyle: textStyleOverride,
    children,
    ...rest
  } = props

  const viewStyle = viewPresets[preset] || viewPresets.primary
  const viewStyles = [viewStyle, styleOverride]
  const textStyle = textPresets[preset] || textPresets.primary
  const textStyles = [textStyle, textStyleOverride]
  console.log({
    disabled,
    btnDisabled,
  })
  const content = children || <Text tx={tx} text={text} style={textStyles} />

  if (disabled) {
    return <View style={[viewStyles, disabled && btnDisabled]}>{content}</View>
  }
  return (
    <TouchableOpacity style={[viewStyles, disabled && btnDisabled]} {...rest}>
      {content}
    </TouchableOpacity>
  )
}
