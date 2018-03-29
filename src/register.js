import { registerMethod } from 'did-resolver'
import IPFS from 'ipfs-mini'
import { promisifyAll } from 'bluebird'

function register (opts = {}) {
  const conf = opts.ipfsConf || { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }
  const ipfs = promisifyAll(new IPFS(conf))

  async function resolve (did, parsed) {
    // since we don't support UPDATE operation yet we only fetch the document from ipfs
    let doc
    try {
      doc = await ipfs.catJSONAsync(parsed.id)
    } catch (e) {}
    if (!doc || !doc.signingKey) throw new Error('Invalid muport did')

    return wrapDocument(did, doc)
  }
  registerMethod('muport', resolve)
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
    "muportData": {
      "nym": muportDocument.publicProfile.name
    }
  }
  if (muportDocument.symEncryptedData) doc.muportData.symEncryptedData = muportDocument.symEncryptedData
  if (muportDocument.recoveryNetwork) doc.muportData.recoveryNetwork = muportDocument.recoveryNetwork
  return doc
}

module.exports = register
