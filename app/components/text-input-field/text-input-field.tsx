import React from "react"
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { translate, TxKeyPath } from "../../i18n"
import { textInputError, textInputErrorMessage, textInputStyle } from "../../theme/elements"

// currently we have no presets, but that changes quickly when you build your app.
const PRESETS: { [name: string]: ViewStyle } = {
  default: {},
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
}

/**
 * A component which has a label and an input together.
 */
export function TextInputField(props: any) {
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
    ...rest
  } = props

  // let containerStyles = [PRESETS[preset], styleOverride]
  let inputStyles = [textInputStyle, inputStyleOverride]
  let actualPlaceholder = placeholderTx ? translate(placeholderTx) : placeholder

  if (errors[name] && errors[name].message) {
    inputStyles.push(textInputError)
  }

  return (
    <View>
      <TextInput
        style={inputStyles}
        placeholder={actualPlaceholder}
        onChangeText={onChangeText}
        {...rest}
      />
      {errors[name] && errors[name].message && (
        <Text style={textInputErrorMessage}>{errors[name].message}</Text>
      )}
    </View>
  )
}
