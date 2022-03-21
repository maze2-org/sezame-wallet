import { ImageStyle, TextStyle, ViewStyle } from "react-native"
import { color, spacing, typography } from "theme"

const CURRENCY_ROW: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  marginBottom: spacing[3],
  alignItems: "center",
}
const CURRENCY_ROW_NAME: ViewStyle = {
  flexGrow: 1,
}
const CURRENCY_ROW_BUTTON: TextStyle = {}
const CURRENCY_ROW_LOGO: ViewStyle = {
  backgroundColor: "white",
  borderRadius: 20,
  padding: spacing[1],
  marginRight: spacing[2],
}

const styles = {
  CURRENCY_ROW,
  CURRENCY_ROW_NAME,
  CURRENCY_ROW_BUTTON,
  CURRENCY_ROW_LOGO,
}
export default styles
