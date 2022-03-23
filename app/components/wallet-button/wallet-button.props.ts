import { StyleProp, TextStyle, TouchableOpacityProps, ViewStyle } from "react-native"
import { WalletButtonPresetNames } from "./wallet-button.presets"
import { TxKeyPath } from "../../i18n"

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath

  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string

  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  /**
   * An optional style override useful for the button text.
   */
  textStyle?: StyleProp<TextStyle> | Array<StyleProp<TextStyle>>

  /**
   * One of the different types of text presets.
   */
  preset?: WalletButtonPresetNames

  /**
   * One of the different types of text presets.
   */
  children?: React.ReactNode

  disabled?: boolean
  type?: "primary" | "secondary" | "transparent"
  outline?: boolean
}
