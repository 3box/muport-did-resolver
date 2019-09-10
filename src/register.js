import { registerMethod } from 'did-resolver'
import fetch from 'node-fetch'

const INFURA = 'https://ipfs.infura.io/ipfs/'

export async function resolve (did, parsed) {
  let doc = await fetchMuPortDoc(null, parsed.id)
  return wrapDocument(did, doc)
}

export function getResolver(config) {
  return { 'muport': resolve }
}

async function fetchMuPortDoc (ipfs, ipfsHash) {
  let doc
  try {
    doc = ipfs ? JSON.parse(await ipfs.cat(ipfsHash)) : await httpFetch(ipfsHash)
  } catch (e) {}
  if (!doc || doc.version !== 1 || !doc.signingKey || !doc.managementKey || !doc.asymEncryptionKey) {
    try {
      if (ipfs) await ipfs.pin.rm(ipfsHash)
    } catch (e) {}
    throw new Error('Invalid muport did')
  }
  return doc
}

async function httpFetch (cid) {
  return (await fetch(INFURA + cid)).json()
}

function wrapDocument (did, muportDocument) {
  let doc = {
    "@context": "https://w3id.org/did/v1",
    "id": did,
    "publicKey": [{
      "id": did + "#signingKey",
      "type": "Secp256k1VerificationKey2018",
      "owner": did,
      "publicKeyHex": muportDocument.signingKey
    }, {
      "id": did + "#managementKey",
      "type": "Secp256k1VerificationKey2018",
      "owner": did,
    }, {
      "id": did + "#encryptionKey",
      "type": "Curve25519EncryptionPublicKey",
      "owner": did,
      "publicKeyBase64": muportDocument.asymEncryptionKey
    }],
    "authentication": [{
      "type": "Secp256k1SignatureAuthentication2018",
      "publicKey": did + "#signingKey"
    }],
    "muportData": {}
  }
  if (muportDocument.managementKey.length === 42) {
    doc.publicKey[1].ethereumAddress = muportDocument.managementKey
  } else {
    doc.publicKey[1].publicKeyHex = muportDocument.managementKey
  }
  if (muportDocument.publicProfile) doc.uportProfile = muportDocument.publicProfile
  if (muportDocument.symEncryptedData) doc.muportData.symEncryptedData = muportDocument.symEncryptedData
  if (muportDocument.recoveryNetwork) doc.muportData.recoveryNetwork = muportDocument.recoveryNetwork
  return doc
}