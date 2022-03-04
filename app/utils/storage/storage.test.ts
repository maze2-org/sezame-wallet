import { MMKV } from "react-native-mmkv"
import { load, saveString } from "./storage"

// fixtures
const VALUE_OBJECT = { x: 1 }
const VALUE_STRING = JSON.stringify(VALUE_OBJECT)

jest.mock("react-native-mmkv")

const MMKVMock = MMKV as jest.MockedClass<typeof MMKV>

jest.spyOn(MMKVMock.prototype, "getString").mockImplementation(() => {
  return VALUE_STRING
})

beforeEach(() => {
  MMKVMock.mockClear()
})

test("save", async () => {
  await saveString("something", VALUE_STRING)
  expect(MMKVMock.prototype.set).toHaveBeenCalledWith("something", VALUE_STRING)
})

test("load", async () => {
  const value = await load("something")
  expect(MMKVMock.prototype.getString).toHaveBeenCalledWith("something")
  expect(value).toEqual(JSON.parse(VALUE_STRING))
})
