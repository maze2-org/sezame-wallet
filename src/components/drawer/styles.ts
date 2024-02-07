import { TextStyle, ViewStyle } from "react-native"
import { color, spacing, typography } from "theme"


const DRAWER_BTN_CANCEL: ViewStyle = {
  backgroundColor: color.transparent,
}
const DRAWER_BTN_OK: ViewStyle = {
  backgroundColor: color.palette.gold,
  borderRadius: 80,
}
const DRAWER_BTN_TEXT: TextStyle = {
  fontSize: 13,
  lineHeight: 17.7,
  fontFamily: typography.primary,
  paddingVertical: spacing[2],
  fontWeight: "600",
}
const DRAWER_CARD: ViewStyle = {
  backgroundColor: "#353535",
  borderRadius: 10,
  marginVertical: spacing[4],
}
const DRAWER_CARD_ITEM: ViewStyle = {
  justifyContent: "space-between",
  paddingHorizontal: spacing[5],
  paddingVertical: spacing[4],
  flexDirection: "row",
  alignItems: "center",
}

const overlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  alignContent: "center",
  display: "flex",
  backgroundColor: "rgba(0, 0, 0, 0.93)",
  zIndex: 100,
}

const popup: ViewStyle = {
  position: "absolute",
  left: -1,
  bottom: 0,
  right: -1,
  backgroundColor: "#111111",
  alignItems: "center",
  paddingTop: 10,
  flexGrow: 1,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  elevation: 20,
  shadowColor: "#52006A",
  borderColor: "#333",
  borderWidth: 1,
  borderBottomWidth: 0,
  paddingHorizontal: 20,
  paddingBottom: spacing[3],
}

const title: TextStyle = {
  textAlign: "left",
  color: "white",
  alignSelf: "flex-start",
  fontSize: 18,
  fontWeight: "bold",
  marginVertical: 10,
  lineHeight: 25,
}

const body: ViewStyle = {
  flexGrow: 1,
  width: "100%",
  marginVertical: spacing[2],
}

const actions: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "stretch",
  width: "100%",
}

const actionBtn: ViewStyle = {
  flexGrow: 1,
  width: "50%",
}

const actionBtnMarginRight: ViewStyle = {
  marginRight: 5,
}

const actionBtnMarginLeft: ViewStyle = {
  marginLeft: 5,
}

const styles = {
  overlay,
  popup,
  title,
  body,
  actions,
  actionBtn,
  actionBtnMarginRight,
  actionBtnMarginLeft,
  DRAWER_BTN_CANCEL,
  DRAWER_BTN_OK,
  DRAWER_BTN_TEXT,
  DRAWER_CARD,
  DRAWER_CARD_ITEM,
}

export default styles
