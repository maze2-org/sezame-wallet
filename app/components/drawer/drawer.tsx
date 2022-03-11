import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import { SafeAreaView } from "react-native-safe-area-context"
import { SvgXml } from "react-native-svg"
import { BlurView } from "@react-native-community/blur"
import popupTopIcon from "../../../assets/svg/popup-top-icon.svg"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

export interface DrawerProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  children?: any
  actions?: any[]
  title: string
}

/**
 * Describe your component here
 */
export const Drawer = observer(function Drawer(props: DrawerProps) {
  const { style } = props
  const styles = Object.assign({}, CONTAINER, style)

  return (
    <View>
      {/* Main fame (overlay) */}
      <View style={styles}>
        {/* Main fame (window) */}
        <SvgXml xml={popupTopIcon} />
        <Text>{props.title}</Text>
        <View>{props.children}</View>
        <View>{props.actions && props.actions.map((btn) => btn)}</View>
      </View>
    </View>
  )
})
