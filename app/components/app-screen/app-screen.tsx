import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import { SafeAreaView } from "react-native-safe-area-context"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

export interface AppScreenProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  children?: any
}

/**
 * Describe your component here
 */
export const AppScreen = observer(function AppScreen(props: AppScreenProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <SafeAreaView {...props} style={{ height: "100%", display: "flex", flex: 1 }}>
      {props.children}
    </SafeAreaView>
  )
})
