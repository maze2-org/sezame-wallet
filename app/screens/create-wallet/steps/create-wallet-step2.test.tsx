import * as React from "react"

import { render, waitFor } from "@testing-library/react-native"
import { CreateWalletStep2 } from "./create-wallet-step2"

it("Shows disabled Next on initial render", async () => {
  const { getByText } = render(<CreateWalletStep2 name="step2" />)

  await waitFor(() => {
    expect(getByText(/Next/i)).toBeDisabled()
  })
})
