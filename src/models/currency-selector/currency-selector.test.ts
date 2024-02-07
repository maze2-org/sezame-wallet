import { CurrencySelectorModel } from "./currency-selector"

test("can be created", () => {
  const instance = CurrencySelectorModel.create({})

  expect(instance).toBeTruthy()
})
