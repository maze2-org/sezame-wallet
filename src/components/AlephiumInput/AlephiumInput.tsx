import React from "react"
import { TextInput, View, StyleSheet } from "react-native"
import { Text } from "components"
import { SvgXml } from "react-native-svg"
import handCoinIcon from "assets/icons/hand-coin.svg"
import { color, typography } from "theme"
import { palette } from "theme/palette.ts"
import { textInputErrorMessage } from "theme/elements.ts"

type IProps = {
  value: string,
  onBlur: () => void
  onChangeText: (value: string) => void
  errorMessage?: string
}

const AlephiumInput: React.FC<IProps> = ({ value, onBlur, onChangeText, errorMessage }) => {
  return (
    <>
      <View style={styles.labelWrapper}>
        <Text style={styles.label}>Amount to bridge</Text>
        <View style={styles.inputFiledWrapper}>
          <TextInput
            value={value}
            onBlur={onBlur}
            numberOfLines={1}
            returnKeyType={"done"}
            keyboardType="numeric"
            style={styles.inputFiled}
            onChangeText={onChangeText}
          />
          <SvgXml style={styles.inputIcon} width="28" height="28" xml={handCoinIcon} />
        </View>
      </View>
      {errorMessage &&
        <Text style={textInputErrorMessage}>{errorMessage}</Text>
      }
    </>
  )
}

export default AlephiumInput

const styles = StyleSheet.create({
  labelWrapper: {
    gap: 4,
  },
  inputFiledWrapper: {
    position: "relative",
  },
  inputFiled: {
    fontSize: 16,
    width: "100%",
    color: palette.white,
    backgroundColor: palette.darkBlack,
    borderRadius: 8,
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 35,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    color: color.palette.grey,
    textTransform: "uppercase",
    fontFamily: typography.primary,
  },

  inputIcon: {
    position: "absolute",
    right: 5,
    top: 10,
  },
})
