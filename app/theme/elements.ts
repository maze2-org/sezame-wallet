import { TextStyle, ViewStyle } from "react-native"
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

export const RootPageStyle: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
  padding: spacing[2],
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
}

export const textInputError: TextStyle = {
  borderWidth: 1,
  borderColor: color.palette.orange,
  color: color.palette.orange,
}

export const text: TextStyle = {
  color: color.palette.white,
  fontFamily: typography.primary,
}

export const bold: TextStyle = { fontWeight: "bold" }
export const headerTitle: TextStyle = {
  ...bold,
  fontSize: 18,
  // lineHeight: 15,
  textAlign: "center",
  letterSpacing: 1.5,
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
