import { withRootStore } from "models"
import { ImageStyle, TextStyle, ViewStyle } from "react-native"
import { color, spacing, typography } from "."

/**
 * Roles for colors.  Prefer using these over the palette.  It makes it easier
 * to change things.
 *
 * The only roles we need to place in here are the ones that span through the app.
 *
 * If you have a specific use-case, like a spinner color.  It makes more sense to
 * put that in the <Spinner /> component.
 */
export const BackgroundStyle: ImageStyle = {
  flex: 1,
  justifyContent: "space-between",
}

export const RootPageStyle: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  padding: spacing[0],
  display: "flex",
}

export const textInput: TextStyle = {
  color: color.palette.white,
  borderColor: color.palette.white,
  borderWidth: 1,
  borderRadius: 4,
  padding: spacing[2],
  margin: spacing[4],
}

export const textInputStyle: TextStyle = {
  borderWidth: 1,
  borderColor: color.palette.white,
  color: color.palette.white,
}

export const textInputErrorMessage: TextStyle = {
  color: color.palette.orange,
  paddingTop: spacing[2],
}

export const textInputError: TextStyle = {
  borderBottomColor: color.palette.orange,
  borderBottomWidth: 1,
  color: color.palette.gold,
}

export const checkboxLabelError: TextStyle = {
  color: color.palette.gold,
}

export const text: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}

export const bold: TextStyle = { fontWeight: "bold" }
export const headerTitle: TextStyle = {
  ...bold,
  fontSize: 22,
  justifyContent: "center",
  // lineHeight: 15,
}

export const createBtn: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: color.palette.deepPurple,
  margin: spacing[4],
}

export const btnDisabled: ViewStyle = {
  backgroundColor: color.palette.lightGrey,
}

export const demoText: TextStyle = {
  ...bold,
  fontSize: 13,
  letterSpacing: 2,
}

export const footBtn: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
}

export const conditionsCheckbox: ViewStyle = {}

export const checkboxContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  padding: spacing[2],

  flexShrink: 1,
}
export const label: TextStyle = {
  fontSize: 14,
  flexShrink: 1,
}
export const checkbox: ViewStyle = {}
export const pager: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing[4],
}

export const mnemonicContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  paddingVertical: spacing[4],

  justifyContent: "space-around",
  alignItems: "center",
}
export const mnemonicStyle: TextStyle = {
  fontSize: 16,
  padding: spacing[3],
  flexShrink: 1,
}

export const copyBtn: ViewStyle = {
  padding: spacing[3],
}

export const warning: TextStyle = {
  padding: spacing[2],
}

export const btn: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
}
export const btnDefault: TextStyle = {
  ...btn,
  ...text,
  ...bold,
  fontSize: 15,
  letterSpacing: 2,
  backgroundColor: color.palette.deepPurple,
}

export const LogoStyle: ImageStyle = {
  alignSelf: "center",
  marginVertical: spacing[5],
  maxWidth: "100%",
  width: 247,
  height: 51,
}

export const CONTAINER: ViewStyle = {
  display: "flex",
  justifyContent: "space-between",
  paddingVertical: spacing[5],
  paddingHorizontal: spacing[7],
  flexDirection: "column",
  flexGrow: 1,
}

export const containerGrowable: ViewStyle = {
  flexGrow: 1,
}

export const PRIMARY_BTN: ViewStyle = {
  width: "100%",
  borderRadius: 80,
  height: 47,
  backgroundColor: color.palette.gold,
  marginVertical: spacing[2],
}

export const PRIMARY_TEXT: TextStyle = {
  color: color.palette.white,
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "600",
}

export const PRIMARY_OUTLINE_BTN: TextStyle = {
  backgroundColor: color.transparent,
  width: "100%",
}

export const TEXT_CENTTER: TextStyle = {
  textAlign: "center"
}

export const NORMAL_TEXT: TextStyle = {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "400",
}

export const SMALL_TEXT: TextStyle = {
  fontSize: 10,
  lineHeight: 14,
  fontWeight: "400",
  color: "#C9C9C9",
}

export const DropdownContainerStyle: ViewStyle = {
  backgroundColor: color.transparent,
  borderBottomColor: color.palette.white,
  borderBottomWidth: 1,
  borderTopWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  paddingHorizontal: 0,
  marginBottom: spacing[3]
}

export const DropdownTextStyle: TextStyle = {
  color: color.palette.white,
  fontSize:15,
  lineHeight: 20,
  fontWeight: "400",
  height: 40,
  textAlignVertical: "center"
}

export const DropdownListStyle: ViewStyle = {
  borderColor: color.palette.white,
  backgroundColor: color.transparent
}
export const DropdownArrowStyle: TextStyle = {
  color: color.palette.gold
}
export const SesameLogo = require("../../../assets/images/Logo.png")
export const MainBackground = require("../../../assets/images/bg-noise.png")
