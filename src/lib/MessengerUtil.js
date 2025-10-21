import CryptoJS from 'crypto-js'
import { Buffer } from 'buffer'
import * as rippleKeyPairs from 'ripple-keypairs'
import { Epoch, ActionCode, ObjectType, NonceMax } from './MessengerConst'
import { ConsoleWarn, HalfSHA512, QuarterSHA512Message, QuarterSHA512WordArray, Str2Hex } from './AppUtil'

function AddressToName(address_map, address) {
  if (!address) {
    return 'not a address'
  }
  if (address_map[address] != null) {
    return address_map[address]
  } else {
    return `${address.substring(0, 7)}...${address.substring(address.length - 5)}`
  }
}

// async function ReadDraft(address) {
//   try {
//     const draft = await AsyncStorage.getItem(`${address}#draft`)
//     return draft
//   } catch (e) {
//     ConsoleError(e)
//     return false
//   }
// }

// group by order by
function GBOB(array, name, size) {
  let tmp_array = []
  for (let m = 0; m < array.length; m++) {
    const i = array[m]
    let flag_new_name = true
    for (let n = 0; n < tmp_array.length; n++) {
      const ti = tmp_array[n];
      if (i[name] == ti[name]) {
        flag_new_name = false
        if (i[size] >= ti[size]) {
          tmp_array[n][size] = i[size]
        }
        break
      }
    }
    if (flag_new_name) {
      tmp_array.push(i)
    }
  }
  return tmp_array
}

//input encode:'utf-8', 'ascii', 'binary'
//output encode:'hex', 'binary', 'base64'
var encrypt = function (key, iv, data) {
  var cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  var crypted = cipher.update(data, 'utf8', 'base64')
  crypted += cipher.final('base64')
  return crypted
}

var decrypt = function (key, iv, crypted) {
  var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  var decoded = decipher.update(crypted, 'base64', 'utf8')
  decoded += decipher.final('utf8')
  return decoded
}

function FileHash(buffer) {
  const wordArray = CryptoJS.lib.WordArray.create(buffer)
  const hash = QuarterSHA512WordArray(wordArray)
  return hash
}

function FileEHash(address1, address2, hash) {
  let tmpStr = ''
  if (address1 > address2) {
    tmpStr = address1 + address2 + hash
  } else {
    tmpStr = address2 + address1 + hash
  }
  const ehash = QuarterSHA512WordArray(tmpStr)
  return ehash
}

async function MasterKeySet(masterKey) {
  let salt = crypto.randomBytes(16).toString('hex')
  let key = HalfSHA512(salt + masterKey).toString('hex').slice(0, 32)
  let iv = crypto.randomBytes(8).toString('hex')
  let info = { "MasterKey": masterKey }
  let crypted = encrypt(key, iv, JSON.stringify(info))
  let save = { "salt": salt, "iv": iv, "ct": crypted }
  try {
    await AsyncStorage.setItem('<#MasterKey#>', JSON.stringify(save))
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function MasterKeyDerive(masterKey) {
  try {
    const result = await AsyncStorage.getItem('<#MasterKey#>')
    let json = JSON.parse(result)
    let key = HalfSHA512(json.salt + masterKey).toString('hex').slice(0, 32)
    let mk = decrypt(key, json.iv, json.ct)
    mk = JSON.parse(mk)
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function MasterConfig({ multi, dark }) {
  try {
    const result = await AsyncStorage.getItem('<#MasterConfig#>')
    let config = { multi: false, dark: false }
    if (result != null) {
      let json = JSON.parse(result)
      config = json
    }

    if (multi != null) {
      config.multi = multi
    }
    if (dark != null) {
      config.dark = dark
    }

    await AsyncStorage.setItem('<#MasterConfig#>', JSON.stringify(config))
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function AvatarCreateNew(name, password) {
  let seed = rippleKeyPairs.generateSeed(password, 'secp256k1')
  let keypair = rippleKeyPairs.deriveKeypair(seed)
  let address = rippleKeyPairs.deriveAddress(keypair.publicKey)
  let salt = crypto.randomBytes(16).toString('hex')
  let key = HalfSHA512(salt + password).toString('hex').slice(0, 32)
  let iv = crypto.randomBytes(8).toString('hex')
  let msg = { "seed": seed }
  let crypted = encrypt(key, iv, JSON.stringify(msg))
  let save = { "salt": salt, "iv": iv, "ct": crypted }

  try {
    const result = await AsyncStorage.getItem('<#Avatars#>')
    let avatarList = []
    if (result != null) {
      avatarList = JSON.parse(result)
    }
    avatarList.unshift({ Name: name, Address: address, save: JSON.stringify(save), LoginAt: Date.now() })
    await AsyncStorage.setItem('<#Avatars#>', JSON.stringify(avatarList))
    return seed
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function AvatarCreateWithSeed(name, seed, password) {
  let keypair = rippleKeyPairs.deriveKeypair(seed)
  let address = rippleKeyPairs.deriveAddress(keypair.publicKey)
  let salt = crypto.randomBytes(16).toString('hex')
  let key = HalfSHA512(salt + password).toString('hex').slice(0, 32)
  let iv = crypto.randomBytes(8).toString('hex')
  let msg = { "seed": seed }
  let crypted = encrypt(key, iv, JSON.stringify(msg))
  let save = { "salt": salt, "iv": iv, "ct": crypted }

  try {
    const result = await AsyncStorage.getItem('<#Avatars#>')
    let avatarList = []
    if (result != null) {
      avatarList = JSON.parse(result)
    }
    let new_flag = true
    avatarList.forEach(avatar => {
      if (avatar.Address == address) {
        new_flag = false
      }
    })
    if (new_flag) {
      avatarList.unshift({ Name: name, Address: address, save: JSON.stringify(save), LoginAt: Date.now() })
      await AsyncStorage.setItem('<#Avatars#>', JSON.stringify(avatarList))
    }
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function AvatarNameEdit(name, seed, password) {
  let keypair = rippleKeyPairs.deriveKeypair(seed)
  let address = rippleKeyPairs.deriveAddress(keypair.publicKey)
  let salt = crypto.randomBytes(16).toString('hex')
  let key = HalfSHA512(salt + password).toString('hex').slice(0, 32)
  let iv = crypto.randomBytes(8).toString('hex')
  let msg = { "seed": seed }
  let crypted = encrypt(key, iv, JSON.stringify(msg))
  let save = { "salt": salt, "iv": iv, "ct": crypted }

  try {
    const result = await AsyncStorage.getItem('<#Avatars#>')
    let avatarList = []
    if (result != null) {
      avatarList = JSON.parse(result)
      let tmp = []
      avatarList.forEach(avatar => {
        if (avatar.Address != address) {
          tmp.push(avatar)
        }
      })
      avatarList = tmp
    }
    avatarList.push({ Name: name, Address: address, save: JSON.stringify(save), LoginAt: Date.now() })
    await AsyncStorage.setItem('<#Avatars#>', JSON.stringify(avatarList))
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

// async function AvatarLoginTimeReset(timestamp) {
//   try {
//     const result = await AsyncStorage.getItem('<#Avatars#>')
//     let avatarList = []
//     if (result != null) {
//       avatarList = JSON.parse(result)
//       let tmp = []
//       avatarList.forEach(avatar => {
//         avatar.LoginAt = timestamp
//         tmp.push(avatar)
//       })
//       avatarList = tmp
//     }
//     await AsyncStorage.setItem('<#Avatars#>', JSON.stringify(avatarList))
//     return true
//   } catch (e) {
//     ConsoleError(e)
//     return false
//   }
// }

async function AvatarLoginTimeUpdate(address) {
  // ConsoleWarn(`AvatarLoginTimeUpdate::::address}`)
  try {
    const result = await AsyncStorage.getItem('<#Avatars#>')
    let avatarList = []
    let logout_avatar = null
    if (result != null) {
      avatarList = JSON.parse(result)
      let tmp = []
      avatarList.forEach(avatar => {
        if (avatar.Address != address) {
          tmp.push(avatar)
        } else {
          logout_avatar = avatar
          logout_avatar.LoginAt = Date.now()
        }
      })
      avatarList = tmp
    }
    if (logout_avatar != null) {
      avatarList.unshift(logout_avatar)
    }
    await AsyncStorage.setItem('<#Avatars#>', JSON.stringify(avatarList))
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function AvatarDerive(strSave, masterKey) {
  try {
    let jsonSave = JSON.parse(strSave)
    let key = HalfSHA512(jsonSave.salt + masterKey).toString('hex').slice(0, 32)
    strSave = decrypt(key, jsonSave.iv, jsonSave.ct)
    let seed = JSON.parse(strSave).seed
    return seed
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

function ParseQrcodeAddress(qrcode) {
  try {
    let json = JSON.parse(qrcode)
    let address = json.Address
    if (json.PublicKey) {
      address = rippleKeyPairs.deriveAddress(json.PublicKey)
    }
    return { Relay: json.Relay, Address: address }
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

async function AvatarRemove(address) {
  try {
    const result = await AsyncStorage.getItem('<#Avatars#>')
    let avatar_list = []
    if (result != null) {
      avatar_list = JSON.parse(result)
      for (let i = 0; i < avatar_list.length; i++) {
        const avatar = avatar_list[i]
        if (avatar.Address == address) {
          avatar_list.splice(i, 1)
          break
        }
      }
    }
    await AsyncStorage.setItem('<#Avatars#>', JSON.stringify(avatar_list))
    return true
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

function ParseQrcodeSeed(qrcode) {
  try {
    let json = JSON.parse(qrcode)
    let keypair = rippleKeyPairs.deriveKeypair(json.Seed)
    return { Name: json.Name, Seed: json.Seed }
  } catch (e) {
    ConsoleError(e)
    return false
  }
}

function DHSequence(partition, timestamp, address1, address2) {
  let tmpStr = ''
  if (address1 > address2) {
    tmpStr = address1 + address2
  } else {
    tmpStr = address2 + address1
  }
  let tmpInt = parseInt(HalfSHA512(tmpStr).substring(0, 6), 16)
  let cursor = (tmpInt % partition) * 1000
  let seq = parseInt((timestamp - (Epoch + cursor)) / (partition * 1000))
  return seq
}

function Sign(msg, sk) {
  let msgHexStr = Str2Hex(msg)
  let sig = rippleKeyPairs.sign(msgHexStr, sk)
  return sig
}

function verifySignature(msg, sig, pk) {
  let hexStrMsg = Str2Hex(msg)
  try {
    return rippleKeyPairs.verify(hexStrMsg, sig, pk)
  } catch (e) {
    return false
  }
}

function VerifyJsonSignature(json) {
  let sig = json["Signature"]
  delete json["Signature"]
  let tmpMsg = JSON.stringify(json)
  if (verifySignature(tmpMsg, sig, json.PublicKey)) {
    json["Signature"] = sig
    return true
  } else {
    ConsoleWarn('signature invalid...')
    return false
  }
}

function VerifyBulletinJson(bulletin) {
  let content_hash = QuarterSHA512Message(bulletin.Content)
  let tmp_json = {
    ObjectType: ObjectType.Bulletin,
    Sequence: bulletin.Sequence,
    PreHash: bulletin.PreHash,
    Quote: bulletin.Quote,
    File: bulletin.File,
    ContentHash: content_hash,
    Timestamp: bulletin.Timestamp,
    PublicKey: bulletin.PublicKey,
    Signature: bulletin.Signature
  }
  if (!bulletin.Quote) {
    delete tmp_json.Quote
  }
  if (!bulletin.File) {
    delete tmp_json.File
  }
  return VerifyJsonSignature(tmp_json)
}

function VerifyObjectResponseJson(object_response) {
  let object_hash = QuarterSHA512Message(object_response.Object)
  let tmp_json = {
    Action: ActionCode.ObjectResponse,
    ObjectHash: object_hash,
    To: object_response.To,
    Timestamp: object_response.Timestamp,
    PublicKey: object_response.PublicKey,
    Signature: object_response.Signature
  }
  return VerifyJsonSignature(tmp_json)
}

function DeriveAddress(publicKey) {
  return rippleKeyPairs.deriveAddress(publicKey)
}

function DeriveKeypair(seed) {
  return rippleKeyPairs.deriveKeypair(seed)
}

function Uint32ToBuffer(num, isBigEndian = true) {
  if (num < 0 || num > 4294967295) {
    return false
  }
  const buf = Buffer.alloc(4)
  if (isBigEndian) {
    buf.writeUInt32BE(num, 0)
  } else {
    buf.writeUInt32LE(num, 0)
  }
  return buf;
}

async function BlobToUint32(blob, isBigEndian = true) {
  const arrayBuffer = await blob.arrayBuffer()
  const buf = Buffer.from(arrayBuffer)
  return isBigEndian
    ? buf.readUInt32BE(0)
    : buf.readUInt32LE(0)
}

function genRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function genNonce() {
  return genRandomInt(0, NonceMax)
}

export {
  AddressToName,
  GBOB,
  // ReadDraft

  FileHash,
  FileEHash,
  encrypt,
  decrypt,
  DeriveAddress,
  DeriveKeypair,
  Sign,
  VerifyJsonSignature,
  VerifyBulletinJson,
  VerifyObjectResponseJson,
  MasterKeySet,
  MasterKeyDerive,
  MasterConfig,
  AvatarCreateNew,
  AvatarCreateWithSeed,
  AvatarDerive,
  // AvatarLoginTimeReset,
  AvatarLoginTimeUpdate,
  AvatarNameEdit,
  AvatarRemove,
  ParseQrcodeAddress,
  ParseQrcodeSeed,
  DHSequence,

  Uint32ToBuffer,
  BlobToUint32,
  genNonce
}