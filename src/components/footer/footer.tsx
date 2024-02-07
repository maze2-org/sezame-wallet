import * as React from "react"
import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, spacing, typography } from "../../theme"
import { Text } from "../text/text"
import back from "@assets/svg/back.svg"
import { SvgXml } from "react-native-svg"
import { btnDisabled } from "theme/elements"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  height: 66.5,
  backgroundColor: color.palette.black,
  width: "100%",
  alignItems: "center",
  display: "flex",
  flexDirection: "row",
}
const FOOTER_BUTTON: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  display: "flex",
  flexDirection: "row",
}
const FOOTER_BUTTON_RIGHT: ViewStyle = {
  ...FOOTER_BUTTON,
  alignItems: "center",
  borderLeftColor: color.palette.lightGrey,
  borderLeftWidth: 1,
}

const FOOTER_BUTTON_DISABLED: ViewStyle = {
  borderLeftColor: color.palette.grey,
  borderLeftWidth: 1,
}

const FOOTER_BUTTON_TEXT: TextStyle = {
  color: color.palette.white,
  marginRight: spacing[2],
}

const FOOTER_BUTTON_TEXT_DISABLED: TextStyle = {
  color: color.palette.grey,
  opacity: 0.2,
}

const IconStyle: ViewStyle = {
  marginRight: spacing[2],
}
export interface FooterProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  onLeftButtonPress?: () => void
  onRightButtonPress?: () => void
  showRightButton?: boolean
  RightButtonIcon?: any
  rightButtonText?: string
  rightButtonDisabled?: boolean
}

/**
 * Describe your component here
 */
export const Footer = observer(function Footer(props: FooterProps) {
  const {
    style,
    onLeftButtonPress,
    showRightButton,
    RightButtonIcon,
    onRightButtonPress,
    rightButtonText,
    rightButtonDisabled,
  } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <View style={styles}>
      <TouchableOpacity onPress={onLeftButtonPress} style={FOOTER_BUTTON}>
        <SvgXml width={24} height={24} xml={back} />
        <Text>Back</Text>
      </TouchableOpacity>
      {!!showRightButton && !rightButtonDisabled && (
        <TouchableOpacity onPress={onRightButtonPress} style={FOOTER_BUTTON_RIGHT}>
          {!!RightButtonIcon && <RightButtonIcon style={FOOTER_BUTTON_TEXT} />}
          {!!rightButtonText && <Text>{rightButtonText}</Text>}
        </TouchableOpacity>
      )}

      {rightButtonDisabled && (
        <View style={FOOTER_BUTTON_RIGHT}>
          {RightButtonIcon && (
            <RightButtonIcon style={[FOOTER_BUTTON_TEXT, FOOTER_BUTTON_TEXT_DISABLED]} />
          )}
          {rightButtonText && <Text style={FOOTER_BUTTON_TEXT_DISABLED}>{rightButtonText}</Text>}
        </View>
      )}
    </View>
  )
})
