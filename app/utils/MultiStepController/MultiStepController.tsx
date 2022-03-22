import  { useFocusEffect } from "@react-navigation/native"
import React, {
  useState,
} from "react"
import { BackHandler } from "react-native"
import { StepProps } from "./Step"
// import { useHistory, useParams } from "react-router";

interface StepsContext {
  onButtonNext: (callback?:()=>void) => void
  onButtonBack: () => void
}
const initialContext: StepsContext = {
  onButtonNext: () => null,
  onButtonBack: () => null,
}

interface StepElement {
  name: string
  component: (stepsProps: StepProps) => JSX.Element
}

export const StepsContext = React.createContext<StepsContext>(initialContext)

const MultiStepsController = ({
  stepElements,
  currentStep,
  next,
  previous,
}: {
  stepElements: Array<StepElement>
  currentStep: number
  next: (stepName: string, callback: () => void) => void
  previous: (stepName: string) => void
}) => {
  const onButtonNext = (callback:()=>void) => {
    next(stepElements[currentStep].name, callback)
  }
  const onButtonBack = () => {
    console.log("Go to previous step")
    previous(stepElements[currentStep].name)
  }

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        console.log("Intercept back button", currentStep)
        onButtonBack()
        return true
      }

      BackHandler.addEventListener("hardwareBackPress", onBackPress)

      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
    }, [currentStep]),
  )

  const Step = stepElements[currentStep].component

  return (
    <StepsContext.Provider value={{ onButtonNext, onButtonBack }}>
      <Step name={stepElements[currentStep].name} />
    </StepsContext.Provider>
  )
}

export default MultiStepsController
