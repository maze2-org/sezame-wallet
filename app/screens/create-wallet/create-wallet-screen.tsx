import React, { Dispatch, FC, SetStateAction, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageBackground, Text, View } from "react-native"
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { Screen } from "../../components"
import { useNavigation } from "@react-navigation/native"
import { CreateWalletStep1 } from "./steps/create-wallet-step1"
import { CreateWalletStep3 } from "./steps/create-wallet-step3"
import MultiStepsController from "../../utils/MultiStepController/MultiStepController"
import { BackgroundStyle, MainBackground, RootPageStyle, SesameLogo } from "../../theme/elements"
import { CreateWalletStep2 } from "./steps/create-wallet-step2"
import { CreateWalletStep4 } from "./steps/create-wallet-step4"
import { StoredWallet } from "../../utils/stored-wallet"
import { defaultAssets } from "utils/consts"

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
    { name: "Step4", component: CreateWalletStep4 },
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
    if (stepName === "Step4") {
      navigation.replace("chooseWallet")
    } else if (stepName === "Step3") {
      // Process is complete
      const storedWallet = new StoredWallet(walletName, seedPhrase, walletPassword)
      await storedWallet.addAssets(defaultAssets)

      await storedWallet.save()
      setCurrentStep(currentStep + 1)
      
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
        <ImageBackground source={MainBackground} style={BackgroundStyle}>
          <MultiStepsController
            stepElements={stepElements}
            currentStep={currentStep}
            next={next}
            previous={previous}
          />
        </ImageBackground>
      </Screen>
    </WalletCreateContext.Provider>
  )
})
