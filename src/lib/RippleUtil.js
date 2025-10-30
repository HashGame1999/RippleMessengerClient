import Decimal from 'decimal.js'
import * as rippleKeyPairs from 'ripple-keypairs'
import { Wallet, ECDSA } from 'xrpl'
import { TestNetURL } from './RippleConst.js'
import { Str2Hex } from './AppUtil.js'

function groupBy(arr, key, groupField = 'txs') {
  const grouped = arr.reduce((acc, item) => {
    const keyValue = item[key]
    const { [key]: _, ...rest } = item
    if (!acc[keyValue]) {
      acc[keyValue] = []
    }
    acc[keyValue].push(rest)
    return acc
  }, {})

  return Object.entries(grouped).map(([keyValue, group]) => ({
    [key]: keyValue,
    [groupField]: group
  }))
}

// ripple
function signMessage(msg, sk) {
  let msgHexStr = Str2Hex(msg)
  let sig = rippleKeyPairs.sign(msgHexStr, sk)
  return sig
}

function signJson(json, seed) {
  let keypairs = rippleKeyPairs.deriveKeypair(seed)
  json.PublicKey = keypairs.publicKey
  json.Timestamp = Date.now()
  let sig = signMessage(JSON.stringify(json), keypairs.privateKey)
  json.Signature = sig
  return json
}

function verifySignature(msg, sig, pk) {
  let hexStrMsg = Str2Hex(msg)
  try {
    return rippleKeyPairs.verify(hexStrMsg, sig, pk)
  } catch (e) {
    return false
  }
}

function verifyJson(json) {
  let sig = json["Signature"]
  delete json["Signature"]
  let tmpMsg = JSON.stringify(json)
  if (verifySignature(tmpMsg, sig, json.PublicKey)) {
    let address = rippleKeyPairs.deriveAddress(json.PublicKey)
    return address
  } else {
    console.log('signature invalid...')
    return false
  }
}

function getWallet(seed, server_url) {
  if (server_url === TestNetURL) {
    return Wallet.fromSeed(seed)
  } else {
    return Wallet.fromSeed(seed, { algorithm: ECDSA.secp256k1 })
  }
}

// math
function fixedDecimals(num, length) {
  const numStr = num.toString();

  if (!numStr.includes('.')) {
    return numStr
  }

  const [integerPart, decimalPart] = numStr.split('.')
  const truncatedDecimal = decimalPart.substring(0, length)
  return `${integerPart}.${truncatedDecimal}`
}

export function preciseMultiply(a, b) {
  const decA = new Decimal(a)
  const decB = new Decimal(b)

  const result = decA.times(decB)
  return result
}

export function preciseDivide(dividend, divisor, length) {
  const decDividend = new Decimal(dividend)
  const decDivisor = new Decimal(divisor)

  const result = decDividend.dividedBy(decDivisor)
  return fixedDecimals(result, length)
}

export {
  groupBy,
  signJson,
  verifyJson,
  getWallet,
  fixedDecimals
}