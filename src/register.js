import { registerMethod } from 'did-resolver'
import IPFS from 'ipfs-mini'
import { promisifyAll } from 'bluebird'
import ethLookup from './eth-lookup'


function register (opts = {}) {
  const conf = opts.ipfsConf || { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }
  const ipfs = promisifyAll(new IPFS(conf))

  async function resolve (did, parsed) {
    let doc = await fetchMuPortDoc(ipfs, parsed.id)
    const newHash = await ethLookup(doc.managementKey, opts.rpcProviderUrl)
    if (newHash) {
      doc = await fetchMuPortDoc(ipfs, newHash)
    }
    return wrapDocument(did, doc)
  }
  registerMethod('muport', resolve)
}

async function fetchMuPortDoc (ipfs, ipfsHash) {
  let doc
  try {
    doc = await ipfs.catJSONAsync(ipfsHash)
  } catch (e) {}
  if (!doc || !doc.signingKey) throw new Error('Invalid muport did')
  return doc
}

function wrapDocument (did, muportDocument) {
  if (muportDocument.version !== 1) throw new Error('Unsupported muportDocument version')
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
      "publicKeyHex": muportDocument.managementKey
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
  if (muportDocument.publicProfile) doc.muportData.publicProfile = muportDocument.publicProfile
  if (muportDocument.symEncryptedData) doc.muportData.symEncryptedData = muportDocument.symEncryptedData
  if (muportDocument.recoveryNetwork) doc.muportData.recoveryNetwork = muportDocument.recoveryNetwork
  return doc
}

module.exports = register
