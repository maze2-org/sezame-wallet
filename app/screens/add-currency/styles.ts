import { ImageStyle, TextStyle, ViewStyle } from "react-native"
import { color, spacing, typography } from "theme"

const CURRENCY_ROW: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  margin: spacing[3],
  alignItems: "center",
}
const CURRENCY_ROW_NAME: ViewStyle = {
  flexGrow: 1,
}
const CURRENCY_ROW_BUTTON: TextStyle = {}
const CURRENCY_ROW_LOGO: ViewStyle = {
  backgroundColor: "white",
  borderRadius: 20,
  padding: spacing[2],
  marginRight: spacing[2],
}
const SEARCH_INPUT: ViewStyle = {
  fontSize: 16,
  borderWidth: 1,
  borderColor: color.line,
  paddingHorizontal: spacing[2],
  height: 45,
  borderTopLeftRadius: 5,
  borderBottomLeftRadius: 5,
  color: color.primary,
  backgroundColor: color.palette.white,
}

const SEARCH_INPUT_CONTAINER: ViewStyle = {
  display: "flex",
  marginVertical: spacing[3],
  paddingHorizontal: spacing[1],
}
const styles = {
  CURRENCY_ROW,
  CURRENCY_ROW_NAME,
  CURRENCY_ROW_BUTTON,
  CURRENCY_ROW_LOGO,
  SEARCH_INPUT,
  SEARCH_INPUT_CONTAINER,
}

export default styles
