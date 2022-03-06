import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { Controller, useForm } from "react-hook-form"
import { TextInputField } from "components/text-input-field/text-input-field"
import { btnDefault, btnDisabled, demoText, footBtn, textInput } from "theme/elements"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import { getFees, makeSendTransaction } from "services/api"
import { showMessage } from "react-native-flash-message"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const SendScreen: FC<StackScreenProps<NavigatorParamList, "send">> = observer(
  function SendScreen({ route }) {
    // Pull in one of our MST stores
    const { currentWalletStore } = useStores()
    const { getAssetById } = currentWalletStore
    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
    } = useForm({ mode: "onChange" })
    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()
    const asset = getAssetById(route.params.coinId)
    const [fees, setFees] = useState<number>(null)
    const onCancel = () => {
      navigation.goBack()
    }

    const onSubmit = async (data) => {
      try {
        const response = await getFees(asset, data.address, data.amount)
        setFees(response)

        const transaction = await makeSendTransaction(asset, response.regular)
        if (!transaction) {
          showMessage({ message: "Unable to Send", type: "danger" })
        } else {
          showMessage({ message: "Transaction sent", type: "success" })
          setFees(null)
        }
      } catch (error) {
        console.error("error sending amount ", error)
        showMessage({ message: "Unable to Send", type: "danger" })
      }
    }

    return (
      <Screen style={ROOT} preset="scroll">
        <Text preset="header" text="send" />
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              name="address"
              style={textInput}
              errors={errors}
              placeholder="Enter your wallet name"
              value={value}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Field is required!",
            },
          }}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInputField
              name="amount"
              style={textInput}
              errors={errors}
              placeholder="Enter amount"
              value={value}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              keyboardType="numeric"
              numberOfLines={1}
              returnKeyType="done"
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Field is required!",
            },
          }}
        />

        <View style={footBtn}>
          <Button
            preset="header"
            text="Cancel"
            style={btnDefault}
            textStyle={demoText}
            onPress={onCancel}
          />
          <Button
            preset="header"
            text="Send"
            textStyle={demoText}
            onPress={handleSubmit(onSubmit)}
            style={[btnDefault, !isValid && { ...btnDisabled }]}
            disabled={!isValid}
          />
        </View>
      </Screen>
    )
  },
)
