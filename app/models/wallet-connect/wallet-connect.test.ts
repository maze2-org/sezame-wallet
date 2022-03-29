import { CurrencySelectorModel } from "./wallet-connect"

test("can be created", () => {
  const instance = CurrencySelectorModel.create({})

  expect(instance).toBeTruthy()
})
