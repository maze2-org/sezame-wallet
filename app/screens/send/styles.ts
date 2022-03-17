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
    fontWeight: "600"
}
const DRAWER_CARD: ViewStyle = {
    backgroundColor: "#353535",
    borderRadius: 10,
    marginVertical: spacing[4]
}
const DRAWER_CARD_ITEM: ViewStyle = {
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    flexDirection: "row",
    alignItems: "center",
}
const CARD_ITEM_TITLE: TextStyle = {
    color: color.palette.gold,
    fontSize: 12,
    lineHeight: 16.34,
    fontWeight: "600"
}
const AMOUNT_STYLE: TextStyle = {
    fontSize: 16,
    lineHeight: 22
}
const AMOUNT_SUB_STYLE: TextStyle = {
    fontSize: 10,
    lineHeight: 14,
    color: "#C9C9C9"
}
const CARD_ITEM_DESCRIPTION: ViewStyle = {
    alignItems: "flex-end"
}
const CARD_ITEM_DIVIDER: ViewStyle = {
    height: 1,
    width: "100%",
    backgroundColor: "#111111"
}
const styles = {
    DRAWER_BTN_CANCEL,
    DRAWER_BTN_TEXT,
    DRAWER_BTN_OK,
    DRAWER_CARD,
    DRAWER_CARD_ITEM,
    CARD_ITEM_TITLE,
    AMOUNT_STYLE,
    AMOUNT_SUB_STYLE,
    CARD_ITEM_DESCRIPTION,
    CARD_ITEM_DIVIDER
}
export default styles