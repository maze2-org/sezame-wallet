import * as React from "react"
import { ImageBackground, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { SafeAreaView } from "react-native-safe-area-context"
import { BackgroundStyle, MainBackground } from "theme/elements"
import { color } from "../../theme"
import { Text } from "components/text/text"

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

  return (
    <SafeAreaView
      {...props}
      style={{
        height: "100%",
        display: "flex",
        flex: 1,
        backgroundColor: color.palette.black,
        flexGrow: 1,
      }}
    >
      <ImageBackground source={MainBackground} style={{ flexGrow: 1 }}>
        {props.children}
      </ImageBackground>
    </SafeAreaView>
  )
})
