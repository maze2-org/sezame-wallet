import { Dimensions, ImageStyle, TextStyle, ViewStyle } from "react-native"
import { color, spacing } from "theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

const DISABLED: ViewStyle = {
  opacity: 0.3,
}

const HEADER: ViewStyle = {
  alignItems: "center",
  marginTop: spacing[6],
  marginBottom: spacing[6],
}

const BODY: ViewStyle = {
  paddingHorizontal: spacing[3],
  marginBottom: spacing[7],
}

const TEXT: TextStyle = {
  color: color.palette.grey,
  fontSize: 10,
  lineHeight: 14,
  fontWeight: "400",
}

const BOLD_TEXT: TextStyle = {
  fontFamily: "Open Sans",
  fontWeight: "700",
  fontSize: 16,
  lineHeight: 22,
  marginBottom: spacing[4],
  color: color.palette.white,
}

const GOLD_TEXT: TextStyle = {
  color: color.palette.gold,
  fontWeight: "300",
  fontSize: 10,
  lineHeight: 14,
  textTransform: "uppercase",
}

const INFORMATOIN_TEXT: TextStyle = {
  color: color.palette.grey,
  fontWeight: "100",
  fontSize: 10,
  lineHeight: 12,
}

const BIG_TEXT: TextStyle = {
  fontFamily: "Open Sans",
  fontWeight: "600",
  fontSize: 27,
  lineHeight: 37,
  color: color.palette.white,
  marginBottom: spacing[1],
}

const MIDDLE_TEXT: TextStyle = {
  fontFamily: "Open Sans",
  fontWeight: "600",
  fontSize: 23,
  lineHeight: 31,
  color: color.palette.white,
  marginRight: spacing[2],
}

const IMG_CONTAINER: ImageStyle = {
  width: 80,
  height: 80,
  backgroundColor: color.palette.white,
  borderRadius: 50,
  padding: spacing[3],
  marginBottom: spacing[2],
}

const IMG: ImageStyle = {
  width: "100%",
  height: "100%",
}

const CARD: ViewStyle = {
  backgroundColor: color.palette.darkBrown,
  padding: spacing[5],
  borderRadius: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing[4],
}

const ROW_ALIGN: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
}

const ICON_ONE: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing[2],
}

const ICON_CONTAINER: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
}

const SCROLL_VIEW: ViewStyle = {
  flex: 1,
}
const SCROLL_VIEW_CONTAINER: ViewStyle = {
  flexGrow: 1,
}

const styles = {
  ROOT,
  DISABLED,
  TEXT,
  BOLD_TEXT,
  GOLD_TEXT,
  INFORMATOIN_TEXT,
  BIG_TEXT,
  MIDDLE_TEXT,
  IMG,
  HEADER,
  IMG_CONTAINER,
  BODY,
  CARD,
  ROW_ALIGN,
  ICON_ONE,
  ICON_CONTAINER,
  SCROLL_VIEW,
  SCROLL_VIEW_CONTAINER,
}

export default styles
