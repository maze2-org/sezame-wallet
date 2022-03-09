import { MMKV } from "react-native-mmkv"

const WALLETS_STORE_ID = "wallets"
/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string, id = WALLETS_STORE_ID): Promise<string | null> {
  try {
    const storage = new MMKV({ id })
    return storage.getString(key)
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

export async function getListOfWallets(): Promise<string[]> {
  const storage = new MMKV({
    id: WALLETS_STORE_ID,
  })
  return storage.getAllKeys().filter((key) => key !== "NAVIGATION_STATE")
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(
  key: string,
  value: string,
  id = WALLETS_STORE_ID,
): Promise<boolean> {
  try {
    const storage = new MMKV({
      id,
    })

    storage.set(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load(key: string, id = WALLETS_STORE_ID): Promise<any | null> {
  try {
    const storage = new MMKV({
      id,
    })
    const almostThere = await storage.getString(key)
    return JSON.parse(almostThere)
  } catch {
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: any, id = WALLETS_STORE_ID): Promise<boolean> {
  try {
    const storage = new MMKV({
      id,
    })
    storage.set(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export async function remove(key: string, id = WALLETS_STORE_ID): Promise<boolean> {
  try {
    const storage = new MMKV({
      id,
    })
    storage.delete(key)
    return true
  } catch (error) {
    console.log("Error removing key", error)
    return false
  }
}

/**
 * Burn it all to the ground.
 */
export async function clear(id = WALLETS_STORE_ID): Promise<boolean> {
  try {
    const storage = new MMKV({
      id,
    })
    await storage.clearAll()
    return true
  } catch {
    return false
  }
}
