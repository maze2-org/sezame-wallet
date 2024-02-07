import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  CipherKey,
  BinaryLike,
} from "crypto"

const saltByteLength = 64
const ivByteLength = 64
const authTagLength = 16

export const encrypt = (password: string, dataRaw: string) => {
  const data = Buffer.from(dataRaw, "utf8")
  const salt = randomBytes(saltByteLength)
  const derivedKey = keyFromPassword(password, salt)
  const iv = randomBytes(ivByteLength)
  const cipher = createCipher(derivedKey, iv)
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
  const payload = {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    noAuthTag: true,
    encrypted: Buffer.concat([encrypted]).toString("hex"),
    version: 1,
  }

  return JSON.stringify(payload)
}

export const decrypt = (password: string, payloadRaw: string) => {
  const payload = JSON.parse(payloadRaw)
  const version = payload.version
  if (version !== 1) {
    throw new Error(`Invalid version: got ${version}, expected: 1`)
  }

  const salt = Buffer.from(payload.salt, "hex")
  const iv = Buffer.from(payload.iv, "hex")
  const encrypted = Buffer.from(payload.encrypted, "hex")

  const authLength = payload.noAuthTag? 0 : authTagLength;

  const derivedKey = keyFromPassword(password, salt)
  const decipher = createDecipher(derivedKey, iv)
  const data = encrypted.slice(0, encrypted.length - authLength)
  const authTag = encrypted.slice(encrypted.length - authLength, encrypted.length)
  if (authLength > 0) {
    decipher.setAuthTag(authTag)
  }
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])

  return decrypted.toString("utf8")
}

const createCipher = (key: CipherKey, iv: BinaryLike | null) => {
  return createCipheriv("aes-256-gcm", key, iv)
}

const createDecipher = (key: CipherKey, iv: BinaryLike | null) => {
  return createDecipheriv("aes-256-gcm", key, iv)
}

const keyFromPassword = (password: BinaryLike, salt: BinaryLike) => {
  return pbkdf2Sync(password, salt, 1000, 32, "sha256")
}
