import React from "react"
import { StyleProp, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native"
import { color, spacing, typography } from "theme"
import { translate, TxKeyPath } from "../../i18n"
import { textInputError, textInputErrorMessage, textInputStyle } from "../../theme/elements"
import { Text } from "../text/text"
// currently we have no presets, but that changes quickly when you build your app.
const PRESETS: { [name: string]: ViewStyle } = {
  default: {},
}
const CONTAINER: ViewStyle = {
  paddingVertical: spacing[2],
}
const LABEL: TextStyle = {
  fontSize: 10,
  lineHeight: 14,
  color: color.palette.grey,
  fontWeight: "600",
  textTransform: "uppercase",
  fontFamily: typography.primary,
}

const INPUT: TextStyle = {
  fontFamily: typography.primary,
  color: color.text,
  minHeight: 44,
  fontSize: 15,
  lineHeight: 20,
  backgroundColor: color.transparent,
  borderBottomWidth: 1,
  borderColor: color.palette.white,
  padding: spacing[0],
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

  forwardedRef?: any

  formFieldRef?: any

  errors?: any

  name?: string
}

/**
 * A component which has a label and an input together.
 */
export function TextInputField(props: TextFieldProps) {
  const {
    placeholderTx,
    placeholder,
    labelTx,
    label,
    preset = "default",
    style: styleOverride,
    inputStyle: inputStyleOverride,
    forwardedRef,
    onChangeText,
    errors,
    name,
    formFieldRef,
    ...rest
  } = props

  const containerStyles = [CONTAINER]
  let inputStyles = [INPUT, inputStyleOverride]
  const actualPlaceholder = placeholderTx ? translate(placeholderTx) : placeholder
  const labelStyle = [LABEL]
  if (errors[name] && errors[name].message) {
    inputStyles.push(textInputError)
  }

  return (
    <View style={containerStyles}>
      <Text preset="fieldLabel" tx={labelTx} text={label} style={labelStyle} />
      <TextInput
        style={inputStyles}
        placeholder={actualPlaceholder}
        onChangeText={onChangeText}
        ref={formFieldRef}
        {...rest}
      />
      {errors[name] && errors[name].message && (
        <Text style={textInputErrorMessage}>{errors[name].message}</Text>
      )}
    </View>
  )
}
