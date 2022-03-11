import EncryptedStorage from "react-native-encrypted-storage"

const WALLETS_STORE_ID = "wallets_store_"

/**
 * Store the key name added to the key store (as react-native-encrypted-storage has no function to list keys out of the box)
 * @param key The key which was added to the key store
 */
async function addKey(key) {
  const idLists = await listIds()
  if (!idLists.includes(key)) {
    idLists.push(key)
    save("pairs", idLists)
  }
}

/**
 * Store the key name removed from the key store (as react-native-encrypted-storage has no function to list keys out of the box)
 * @param key The key which was removed from the key store
 */
async function removeKey(key) {
  let idLists = await listIds()
  idLists = idLists.filter((currentKey) => currentKey !== key)
  save("pairs", idLists)
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    const data = await EncryptedStorage.getItem(key)
    return data
  } catch (e) {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Return the list of wallets currently store in the encrypted storage
 * @returns string[] List of wallet names
 */
export async function getListOfWallets(): Promise<string[]> {
  const keyIds = await load("pairs")
  return keyIds
    ? keyIds
        .filter((id: string) => id.startsWith(WALLETS_STORE_ID))
        .map((id: string) => id.replace(WALLETS_STORE_ID, ""))
    : []
}

export async function listIds(): Promise<string[]> {
  const keyIds = await load("pairs")
  return keyIds ? keyIds : []
}

export async function saveWallet(walletName: string, encryptedWallet: string) {
  const key = WALLETS_STORE_ID + walletName
  await saveString(key, encryptedWallet)
}

export async function loadEncryptedWallet(walletName: string) {
  const key = WALLETS_STORE_ID + walletName
  const data = await EncryptedStorage.getItem(key)
  return data
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await EncryptedStorage.setItem(key, value)
    await addKey(key)
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
export async function load(key: string): Promise<any | null> {
  try {
    const data = await EncryptedStorage.getItem(key)
    return JSON.parse(data)
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
export async function save(key: string, value: any): Promise<boolean> {
  try {
    await EncryptedStorage.setItem(key, JSON.stringify(value))

    await addKey(key)
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
export async function remove(key: string): Promise<boolean> {
  try {
    EncryptedStorage.removeItem(key)
    removeKey(key)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<boolean> {
  try {
    await EncryptedStorage.clear()
    return true
  } catch {
    return false
  }
}
