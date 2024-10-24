import React from "react"
import { Pressable, View, StyleSheet } from "react-native"
import { Text } from "components"
import { palette } from "theme/palette.ts"

type IProps = {
  text: string,
  checked: boolean
  onPress?: () => void
}

const AlephiumPercentCheckBox: React.FC<IProps> = ({ text, checked, onPress }) => {
  return (
    <Pressable
      style={[styles.checkbox, checked && styles.checkboxActive]}
      onPress={() => onPress?.()}>
      <Text style={styles.checkboxText}>{text}</Text>
    </Pressable>
  )
}

export default AlephiumPercentCheckBox

const styles = StyleSheet.create({
  checkbox: {
    paddingVertical: 4,
    width: "33.3%",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.darkBlack,
  },
  checkboxText: {
    fontSize: 14,
    color: palette.white,
  },
  checkboxActive: {
    backgroundColor: "#DBAF00",
  },
})
