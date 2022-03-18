import React, {
  useMemo,
} from "react"
import {
  ImageBackground,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import {
  color,
} from "../../theme"
import {
  observer,
} from "mobx-react-lite"
import {
  SafeAreaView,
} from "react-native-safe-area-context"
import {
  MainBackground,
} from "theme/elements"

const SAFE_AREA_VIEW: TextStyle = {
  flex: 1,
  display: "flex",
  height: "100%",
}
const IMAGE_BACKGROUND: TextStyle = {
  flex: 1,
  display: "flex",
  height: "100%",
  backgroundColor: color.palette.black,
}
const BOTTOM_SAFE_AREA: TextStyle = {
  height: 100,
}

export interface AppScreenProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  children?: any
  unsafe?: boolean,
}

/**
 * Describe your component here
 */
export const AppScreen = observer(function AppScreen(props: AppScreenProps) {
  const { unsafe } = props
  const WrapperComponent = useMemo(() => unsafe ? View : SafeAreaView, [unsafe])

  return (
    <ImageBackground
      source={MainBackground}
      style={IMAGE_BACKGROUND}
    >
      <WrapperComponent
        {...props}
        style={SAFE_AREA_VIEW}
      >
        {props.children}

        {!!unsafe &&
          <View
            style={BOTTOM_SAFE_AREA} />}
      </WrapperComponent>
    </ImageBackground>
  )
})
