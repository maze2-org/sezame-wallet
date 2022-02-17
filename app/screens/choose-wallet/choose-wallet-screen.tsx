import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Header, Screen } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { getListOfWallets } from "../../utils/storage"
import { useForm, Controller } from "react-hook-form"
import { btnDefault, btnDisabled, footBtn, textInput } from "../../theme/elements"
import DropDownPicker from "react-native-dropdown-picker"
import { TextInputField } from "../../components/text-input-field/text-input-field"
import { StoredWallet } from "../../utils/stored-wallet"
import { showMessage } from "react-native-flash-message"
import { currentWalletStore } from "../../models"
import { useNavigation } from "@react-navigation/native"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const ChooseWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "chooseWallet">
> = observer(function ChooseWalletScreen() {
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const [walletNames, setWalletNames] = useState<string[]>([])
  useEffect(() => {
    getListOfWallets().then((walletNames) => {
      setWalletNames(walletNames)
    })
  }, [])

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [itemValue, setItemValue] = useState(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const loadedWallet = await StoredWallet.loadFromStorage(data.walletName, data.walletPassword)
      showMessage({ message: "Wallet decrypted", type: "success" })
      currentWalletStore.open(loadedWallet)
      navigation.navigate("dashboard")
    } catch (err) {
      showMessage({ message: "Unable to decrypt this wallet", type: "danger" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen style={ROOT} preset="fixed">
      <Header headerTx="chooseWallet.title" />

      <Controller
        control={control}
        name="walletName"
        render={({ field: { onChange, value, onBlur } }) => (
          <DropDownPicker
            open={open}
            value={itemValue}
            items={walletNames.map((item) => ({ label: item, value: item }))}
            setOpen={setOpen}
            setValue={setItemValue}
            onChangeValue={(val) => {
              console.log(val)
              onChange(val)
              setValue("walletName", val)
            }}
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
        defaultValue=""
        name="walletPassword"
        render={({ field: { onChange, value, onBlur } }) => (
          <TextInputField
            secureTextEntry={true}
            name="walletPassword"
            style={textInput}
            errors={errors}
            placeholder="Enter your wallet passord"
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

      <View style={footBtn}>
        <Button
          style={[btnDefault, !isValid && { ...btnDisabled }, loading && { ...btnDisabled }]}
          disabled={!isValid || loading}
          text={loading ? "Loading ..." : "Continue"}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <View style={footBtn}>
        <Button
          text="Create or import a new wallet"
          onPress={() => navigation.replace("welcome")}
        />
      </View>
    </Screen>
  )
})
