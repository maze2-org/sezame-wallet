import * as React from "react"

import { fireEvent, render, waitFor } from "@testing-library/react-native"
import { CreateWalletStep1 } from "./create-wallet-step1"
import { act } from "react-test-renderer"
it("Shows enabled continue after valid input", async () => {
  const { getByPlaceholderText, getByText } = render(<CreateWalletStep1 name="step1" />)

  await act(async () => {
    fireEvent.changeText(getByPlaceholderText("Enter your wallet name"), "walletName")
    fireEvent.changeText(getByPlaceholderText("Enter your wallet password"), "password")
  })

  expect(getByText(/Continue/i)).not.toBeDisabled()
})
