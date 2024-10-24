import React from "react"
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { Text } from "components"
import { palette } from "theme/palette.ts"

type IProps = {
  isShow: boolean
  title?: string
  description?: string
  style?: StyleProp<ViewStyle>
}

const AlephiumBridgeBadge: React.FC<IProps> = ({ title, description, style, isShow = true }) => {
  if (!isShow) return
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {description &&
        <Text style={styles.message}>
          {description}
        </Text>
      }
    </View>
  )
}

export default AlephiumBridgeBadge


const styles = StyleSheet.create({
  card: {
    gap: 16,
    width: "100%",
    borderRadius: 6,
    paddingVertical: 19,
    paddingHorizontal: 8,
    backgroundColor: palette.darkBlack,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: palette.white,
  },
  message: {
    fontSize: 14,
    color: palette.white,
  },

  CardGold: {
    backgroundColor: "#DBAF00",
  },
})
