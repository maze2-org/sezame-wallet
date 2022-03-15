import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageBackground, TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, CurrencyDescriptionBlock, Footer, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { Controller, useForm } from "react-hook-form"
import { TextInputField } from "components/text-input-field/text-input-field"
import { BackgroundStyle, btnDefault, btnDisabled, CONTAINER, demoText, footBtn, MainBackground, PRIMARY_BTN, textInput } from "theme/elements"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "models"
import { getFees, makeSendTransaction } from "services/api"
import { showMessage } from "react-native-flash-message"
import walletIcon from "../../../assets/svg/avt.svg"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const SendScreen: FC<StackScreenProps<NavigatorParamList, "send">> = observer(
  function SendScreen({ route }) {
    // styling
    const DashboardStyle: ViewStyle = {
      ...ROOT,
      borderTopColor: "rgba(190, 195, 225, 0.7)",
      borderTopWidth: 1,
      borderStyle: "dashed",
    }

    const WALLET_STYLE: ViewStyle = {
      width: "100%",
      alignItems: "center",
      display: "flex",
      flexDirection: "column"
    }

    const rewardsStyle: TextStyle = {
      color: color.palette.gold,
      fontSize: 10,
      lineHeight: 14,
      paddingVertical: spacing[2]
    }
    const amountStyle: TextStyle = {
      color: color.palette.white,
      fontSize: 27,
      lineHeight:37
    }
    const BUTTON_STYLE: ViewStyle = {
      ...PRIMARY_BTN,
      backgroundColor: color.transparent,
      width: "80%",
      borderColor: color.palette.white,
      borderWidth: 1,
      borderRadius: 80,
      opacity: 0.7
    }
    const BUTTON_TEXT_STYLE: TextStyle = {
      color: color.palette.white,
      fontSize: 13,
      lineHeight: 17.7
    }
    const ALIGN_CENTER: ViewStyle = {
      alignItems: "center"
    }
    const walletLogo = require("../../../assets/images/avt.png")
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
      <Screen style={DashboardStyle} preset="scroll">
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <View style={CONTAINER}>
              <View style={WALLET_STYLE}>
                <CurrencyDescriptionBlock logo={walletLogo} icon={walletIcon}/>
                <Text style={rewardsStyle}>Available rewards @stake1</Text>
                <Text style={amountStyle}>0.459 AVT</Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name="address"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInputField
                      name="address"
                      style={textInput}
                      errors={errors}
                      label="Wallet name"
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
                      label="Amount"
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
              </View>
              <View style={ALIGN_CENTER}>
                <Button
                  style={BUTTON_STYLE}
                  textStyle={BUTTON_TEXT_STYLE}
                >
                  <Text>PREVIEW THE TRANSFER</Text>
                </Button>
              </View>
          </View>
        </ImageBackground>
        <Footer />
      </Screen>
    )
  },
)
