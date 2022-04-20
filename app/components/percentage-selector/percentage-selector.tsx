import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import styles from "./styles"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

export interface PercentageSelectorProps {
  onChange: (value: number) => void
  value: number
}

/**
 * Describe your component here
 */
export const PercentageSelector = observer(function PercentageSelector(
  props: PercentageSelectorProps,
) {
  const { onChange, value } = props

  const pressed = (number: number) => {
    onChange(number)
  }

  console.log("PROPS", props)

  return (
    <View style={styles.percentageRow}>
      <Text
        onPress={() => pressed(25)}
        style={[styles.percentageEntry, value === 25 && styles.percentageEntrySelected]}
      >
        25%
      </Text>
      <Text
        onPress={() => pressed(50)}
        style={[styles.percentageEntry, value === 50 && styles.percentageEntrySelected]}
      >
        50%
      </Text>
      <Text
        onPress={() => pressed(75)}
        style={[styles.percentageEntry, value === 75 && styles.percentageEntrySelected]}
      >
        75%
      </Text>
      <Text
        onPress={() => pressed(100)}
        style={[styles.percentageEntry, value === 100 && styles.percentageEntrySelected]}
      >
        100%
      </Text>
    </View>
  )
})
