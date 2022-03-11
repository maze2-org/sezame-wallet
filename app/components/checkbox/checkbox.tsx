import * as React from "react"
import { TextStyle, TouchableOpacity, View, ViewStyle, Image } from "react-native"
import { Text } from "../text/text"
import { color, spacing } from "../../theme"
import { CheckboxProps } from "./checkbox.props"
import { checkboxLabelError, textInputErrorMessage } from "theme/elements"
import { SvgXml } from "react-native-svg"
import checkIcon from "../../../assets/icons/check.svg"

// const checkIcon = require("../../../assets/icons/check.png")

const ROOT: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  paddingVertical: spacing[2],
  alignSelf: "flex-start",
  alignItems: "center",
}

const DIMENSIONS = { width: 26, height: 26 }

const OUTLINE: ViewStyle = {
  ...DIMENSIONS,
  marginTop: 2, // finicky and will depend on font/line-height/baseline/weather
  justifyContent: "center",
  alignItems: "center",
  borderColor: color.primaryDarker,
  borderRadius: 6,
  backgroundColor: color.palette.darkBlack,
}

const FILL: ViewStyle = {
  width: DIMENSIONS.width - 2.25,
  height: DIMENSIONS.height - 2.25,
  backgroundColor: color.primary,
}

const LABEL: TextStyle = {
  paddingLeft: spacing[4],
  fontSize: 12,
  lineHeight: 16.34,
  fontWeight: "600",
}

const labelStyle: ViewStyle = {
  maxWidth: "100%",
  justifyContent: "center",
}
export function Checkbox(props: CheckboxProps) {
  const numberOfLines = props.multiline ? 0 : 1

  const rootStyle = [ROOT, props.style]
  const outlineStyle = [OUTLINE, props.outlineStyle]

  let checkboxTextStyle = [LABEL]

  if (props.errors && props.errors.length) {
    checkboxTextStyle.push(checkboxLabelError)
  }

  const onPress = props.onToggle ? () => props.onToggle && props.onToggle(!props.value) : null

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        disabled={!props.onToggle}
        onPress={onPress}
        style={rootStyle}
      >
        <View style={outlineStyle}>
          {props.value && <SvgXml width="28" height="28" xml={checkIcon} />}
        </View>
        <View style={labelStyle}>
          <Text
            text={props.text}
            tx={props.tx}
            numberOfLines={numberOfLines}
            style={checkboxTextStyle}
          />
        </View>
      </TouchableOpacity>
      {props.displayErrors && props.errors && props.errors.length > 0 && (
        <View>
          {props.errors.map((err) => (
            <Text style={textInputErrorMessage} text={err} />
          ))}
        </View>
      )}
    </>
  )
}
