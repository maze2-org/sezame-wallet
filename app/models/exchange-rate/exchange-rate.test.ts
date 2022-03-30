import { ExchangeRateModel } from "./exchange-rate"

test("can be created", () => {
  const instance = ExchangeRateModel.create({})

  expect(instance).toBeTruthy()
})
