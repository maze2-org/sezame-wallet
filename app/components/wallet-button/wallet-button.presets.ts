import { ViewStyle, TextStyle } from "react-native"
import { color, spacing } from "../../theme"

/**
 * All text will start off looking like this.
 */
const BASE_VIEW: ViewStyle = {
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[2],
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
}

const BASE_TEXT: TextStyle = {
  paddingHorizontal: spacing[3],
  textTransform: "uppercase",
}

const BASE_BUTTON: ViewStyle = {
  borderWidth: 1,
  borderRadius: 30,
}
const PRIMARY_NORMAL_ACTIVE: ViewStyle = {
  ...BASE_VIEW,
  ...BASE_BUTTON,
  backgroundColor: color.primary,
  borderColor: color.primary,
}

const PRIMARY_NORMAL_TEXT_ACTIVE: ViewStyle = {
  ...BASE_VIEW,
  backgroundColor: color.primary,
}

const PRIMARY_OUTLINE_ACTIVE: ViewStyle = {
  ...BASE_VIEW,
  ...BASE_BUTTON,
  backgroundColor: color.transparent,
  borderColor: color.primary,
} as ViewStyle

const PRIMARY_OUTLINE_TEXT_ACTIVE: ViewStyle = {
  ...BASE_TEXT,

  color: color.primary,
} as ViewStyle

/**
 * All the variations of text styling within the app.
 *
 * You want to customize these to whatever you need in your app.
 */
export const viewPresets: Record<string, ViewStyle> = {
  /**
   * A smaller piece of secondard information.
   */
  primaryNormalActive: PRIMARY_NORMAL_ACTIVE,
  primaryNormalDisabled: {
    ...PRIMARY_NORMAL_ACTIVE,
    backgroundColor: color.palette.lightGrey,
    borderColor: color.palette.lightGrey,
  } as ViewStyle,
  primaryOutlineActive: PRIMARY_OUTLINE_ACTIVE,
  primaryOutlineDisabled: { ...PRIMARY_OUTLINE_ACTIVE, borderColor: color.palette.lightGrey },

  /**
   * A button without extras.
   */
  link: {
    ...BASE_VIEW,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "flex-start",
  } as ViewStyle,
}

export const textPresets: Record<WalletButtonPresetNames, TextStyle> = {
  primaryNormalActive: PRIMARY_NORMAL_TEXT_ACTIVE,
  primaryNormalDisabled: {
    ...PRIMARY_NORMAL_TEXT_ACTIVE,
    color: color.palette.white,
    backgroundColor: color.transparent,
  },
  primaryOutlineActive: PRIMARY_OUTLINE_TEXT_ACTIVE,
  primaryOutlineDisabled: { ...PRIMARY_OUTLINE_TEXT_ACTIVE, color: color.palette.lightGrey },
  link: {
    ...BASE_TEXT,
    color: color.text,
    paddingHorizontal: 0,
    paddingVertical: 0,
  } as TextStyle,
}

/**
 * A list of preset names.
 */
export type WalletButtonPresetNames = keyof typeof viewPresets
