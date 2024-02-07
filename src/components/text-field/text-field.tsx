import React from "react"
import { StyleProp, TextInput, TextInputProps, TextStyle, View, ViewStyle, Image } from "react-native"
import { color, spacing, typography } from "../../theme"
import { translate, TxKeyPath } from "../../i18n"
import { Text } from "../text/text"

// the base styling for the container
const CONTAINER: ViewStyle = {
  paddingVertical: spacing[3],
}

// the base styling for the TextInput
const INPUT: TextStyle = {
  fontFamily: typography.primary,
  color: color.text,
  minHeight: 44,
  fontSize: 15,
  lineHeight: 20,
  backgroundColor: color.transparent,
  borderBottomWidth: 1,
  borderColor: color.palette.white,
  padding: spacing[0]
}
const LABEL: TextStyle = {
  fontSize: 10,
  lineHeight: 14,
  color: color.palette.grey,
  fontWeight: "600",
  textTransform: "uppercase",
}

// currently we have no presets, but that changes quickly when you build your app.
const PRESETS: { [name: string]: ViewStyle } = {
  default: {},
}

const iconStyle: ViewStyle = {
  position: "absolute",
  right: 0,
  top: 9
}
export interface TextFieldProps extends TextInputProps {
  /**
   * The placeholder i18n key.
   */
  placeholderTx?: TxKeyPath

  /**
   * The Placeholder text if no placeholderTx is provided.
   */
  placeholder?: string

  /**
   * The label i18n key.
   */
  labelTx?: TxKeyPath

  /**
   * The label text if no labelTx is provided.
   */
  label?: string

  /**
   * Optional container style overrides useful for margins & padding.
   */
  style?: StyleProp<ViewStyle>

  /**
   * Optional style overrides for the input.
   */
  inputStyle?: StyleProp<TextStyle>

  /**
   * Various look & feels.
   */
  preset?: keyof typeof PRESETS

  forwardedRef?: any,

  icon?: any,

  multiline?: boolean | undefined
}

/**
 * A component which has a label and an input together.
 */
export function TextField(props: TextFieldProps) {
  const {
    placeholderTx,
    placeholder,
    labelTx,
    label,
    preset = "default",
    style: styleOverride,
    inputStyle: inputStyleOverride,
    forwardedRef,
    icon,
    multiline,
    ...rest
  } = props

  const containerStyles = [CONTAINER, PRESETS[preset], styleOverride]
  const inputStyles = [INPUT, inputStyleOverride]
  const actualPlaceholder = placeholderTx ? translate(placeholderTx) : placeholder
  const labelStyle = [LABEL];

  return (
    <View style={containerStyles}>
      <Text preset="fieldLabel" tx={labelTx} text={label} style={labelStyle}/>
      <View>
        <TextInput
          multiline = {multiline}
          placeholder={actualPlaceholder}
          placeholderTextColor={color.palette.lighterGrey}
          underlineColorAndroid={color.transparent}
          {...rest}
          style={inputStyles}
          ref={forwardedRef}
        />
        <View style={iconStyle}>
          <Image source={icon} />
        </View>
      </View>
      
    </View>
  )
}
