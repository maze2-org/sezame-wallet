import * as React from "react"

import { render, waitFor } from "@testing-library/react-native"
import { CreateWalletStep3 } from "./create-wallet-step3"

it("Shows disabled Next on initial render", async () => {
  const { getByText } = render(<CreateWalletStep3 name="step2" />)

  await waitFor(() => {
    expect(getByText(/Next/i)).toBeDisabled()
  })
})
