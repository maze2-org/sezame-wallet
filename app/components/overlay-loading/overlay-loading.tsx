import * as React
  from "react"
import {
  View,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native"
import {
  OverlayLoadingProps,
} from "./overlay-loading.props"
import {
  color,
} from "../../theme"

const CONTAINER: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
}

const CONTAINER_INNER: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
}

const LOADER_BOX: ViewStyle = {
  width: 90,
  height: 90,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: color.palette.lineColor,
}

export function OverlayLoading({ visible }: OverlayLoadingProps) {
  return (
    <Modal
      transparent
      animationType={'fade'}
      visible={visible}
    >
      <View
        style={CONTAINER}>
        <View
          style={CONTAINER_INNER}>
          <View
            style={LOADER_BOX}>
            <ActivityIndicator
              size={"large"}
              color={color.palette.gold}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}
