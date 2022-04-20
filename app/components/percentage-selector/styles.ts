import { TextStyle, ViewStyle } from "react-native"
import { color, spacing, typography } from "theme"

const percentageRow: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  marginHorizontal: -1 * spacing[1],
}

const percentageEntry: TextStyle = {
  backgroundColor: "#111111",
  borderColor: "transparent",
  borderWidth: 1,
  borderRadius: 6,
  paddingVertical: spacing[1],
  paddingHorizontal: spacing[2],
  flexGrow: 1,
  textAlign: "center",
  marginHorizontal: spacing[1],
}

const percentageEntrySelected: TextStyle = {
  backgroundColor: color.primary,
}

const styles = {
  percentageRow,
  percentageEntry,
  percentageEntrySelected,
}
export default styles
