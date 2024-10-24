import React from "react"
import { ActivityIndicator, View, StyleSheet } from "react-native"
import { Text } from "components"

type IProps = {
  message: string
  activityIndicator?:boolean
}

const LoadingTransactionConfirmation: React.FC<IProps> = ({message,activityIndicator = false}): React.ReactElement => {
  return (
    <View style={styles.wrapper}>
      {activityIndicator && <ActivityIndicator />}
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

export default LoadingTransactionConfirmation

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    marginTop: 16,
  },
  message: {
    textAlign: "center",
  },
})
