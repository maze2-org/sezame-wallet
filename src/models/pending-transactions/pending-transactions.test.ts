import { PendingTransactionsModel } from "./pending-transactions"

test("can be created", () => {
  const instance = PendingTransactionsModel.create({})

  expect(instance).toBeTruthy()
})
