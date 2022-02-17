import React, { Dispatch, FC, SetStateAction, useState } from "react"
import { observer } from "mobx-react-lite"
import { Text, View } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { CreateWalletStep1 } from "./steps/create-wallet-step1"
import { CreateWalletStep2 } from "./steps/create-wallet-step2"
import MultiStepsController from "../../utils/MultiStepController/MultiStepController"
import { RootPageStyle } from "../../theme/elements"
import { CreateWalletStep3 } from "./steps/create-wallet-step3"
import { StoredWallet } from "../../utils/stored-wallet"
import { loadString } from "../../utils/storage"

interface WalletCreateContext {
  walletName: string
  walletPassword: string
  seedPhrase: string
  setWalletName: Dispatch<SetStateAction<string>>
  setWalletPassword: Dispatch<SetStateAction<string>>
  setSeedPhrase: Dispatch<SetStateAction<string>>
}
const initialContext: WalletCreateContext = {
  walletName: "",
  walletPassword: "",
  seedPhrase: "",
  setWalletName: () => null,
  setWalletPassword: () => null,
  setSeedPhrase: () => null,
}

export const WalletCreateContext = React.createContext<WalletCreateContext>(initialContext)

export const CreateWalletScreen: FC<
  StackScreenProps<NavigatorParamList, "createWallet">
> = observer(function CreateWalletScreen() {
  const [walletName, setWalletName] = useState<string>("")
  const [walletPassword, setWalletPassword] = useState<string>("")
  const [seedPhrase, setSeedPhrase] = useState<string>("")

  const stepElements = [
    { name: "Step1", component: CreateWalletStep1 },
    { name: "Step2", component: CreateWalletStep2 },
    { name: "Step3", component: CreateWalletStep3 },
  ]

  const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

  const previous = (stepName: string) => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      navigation.navigate("welcome")
    }
  }
  const next = async (stepName: string) => {
    if (stepName === "Step3") {
      // Process is complete
      const storedWallet = new StoredWallet(walletName, seedPhrase, walletPassword)
      await storedWallet.addAutoAsset("BTC")
      await storedWallet.save()
      navigation.navigate("chooseWallet")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const [currentStep, setCurrentStep] = useState(0)

  return (
    <WalletCreateContext.Provider
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
    </WalletCreateContext.Provider>
  )
})
