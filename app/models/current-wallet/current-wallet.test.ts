import { CurrentWalletModel } from "./current-wallet"

test("can be created", () => {
  const instance = CurrentWalletModel.create({})

  expect(instance).toBeTruthy()
})
