import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import { SafeAreaView } from "react-native-safe-area-context"
import { SvgXml } from "react-native-svg"
import popupTopIcon from "../../../assets/svg/popup-top-icon.svg"
import styles from "./styles"

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
  hidden?: boolean
}

/**
 * Describe your component here
 */
export const Drawer = observer(function Drawer(props: DrawerProps) {
  const { style, hidden } = props
  if (hidden) {
    return <></>
  }
  return (
    <View style={styles.overlay}>
      {/* Main fame (overlay) */}
      <View style={[styles.popup, style]}>
        {/* Main fame (window) */}
        <SvgXml xml={popupTopIcon} />
        <Text style={styles.title}>{props.title}</Text>
        <View style={styles.body}>{props.children}</View>
        <View style={styles.actions}>
          {props.actions &&
            props.actions.map((btn, index) => (
              <View
                style={[
                  styles.actionBtn,
                  index === 0 && props.actions.length > 1 && styles.actionBtnMarginRight,
                  index === props.actions.length - 1 &&
                    props.actions.length > 1 &&
                    styles.actionBtnMarginLeft,
                ]}
              >
                {btn}
              </View>
            ))}
        </View>
      </View>
    </View>
  )
})
