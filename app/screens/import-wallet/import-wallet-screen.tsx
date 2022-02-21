import React, { Dispatch, FC, SetStateAction, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Button, Header, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { StoredWallet } from "utils/stored-wallet"
import { ImportWalletStep1 } from "./steps/import-wallet-step1"
import { ImportWalletStep2 } from "./steps/import-wallet-step2"
import MultiStepsController from "utils/MultiStepController/MultiStepController"
import { RootPageStyle } from "theme/elements"
import { defaultAssets } from "utils/consts"

interface _WalletImportContext {
  walletName: string
  walletPassword: string
  seedPhrase: string
  setWalletName: Dispatch<SetStateAction<string>>
  setWalletPassword: Dispatch<SetStateAction<string>>
  setSeedPhrase: Dispatch<SetStateAction<string>>
}
const initialContext: _WalletImportContext = {
  walletName: "",
  walletPassword: "",
  seedPhrase: "",
  setWalletName: () => null,
  setWalletPassword: () => null,
  setSeedPhrase: () => null,
}

export const WalletImportContext = React.createContext<_WalletImportContext>(initialContext)

export const ImportWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "importWallet">
> = observer(function ImportWalletScreen() {
  const [walletName, setWalletName] = useState<string>("")
  const [walletPassword, setWalletPassword] = useState<string>("")
  const [seedPhrase, setSeedPhrase] = useState<string>("")

  const stepElements = [
    { name: "Step1", component: ImportWalletStep1 },
    { name: "Step2", component: ImportWalletStep2 },
  ]
  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const next = async (stepName: string) => {
    if (stepName === "Step2") {
      // Process is complete
      const storedWallet = new StoredWallet(walletName, seedPhrase, walletPassword)
      await storedWallet.addAssets(defaultAssets)

      await storedWallet.save()
      navigation.replace("chooseWallet")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const previous = (stepName: string) => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      navigation.navigate("welcome")
    }
  }
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <WalletImportContext.Provider
      value={{
        walletName,
        walletPassword,
        seedPhrase,
        setWalletPassword,
        setSeedPhrase,
        setWalletName,
      }}
    >
      <Screen preset="scroll" style={RootPageStyle}>
        <MultiStepsController
          stepElements={stepElements}
          currentStep={currentStep}
          next={next}
          previous={previous}
        />
      </Screen>
    </WalletImportContext.Provider>
  )
})
