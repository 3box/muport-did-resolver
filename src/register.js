import { registerMethod } from 'did-resolver'
import IPFS from 'ipfs-mini'

function register (ipfsConf) {
  const conf = ipfsConf || { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }
  const ipfs = new IPFS(conf)

  async function resolve (did, parsed) {
    // since we don't support UPDATE operation yet we only fetch the document from ipfs
    return new Promise((resolve, reject) => {
      ipfs.catJSON(parsed.id, (err, doc) => {
        if (err || !doc.signingKey) reject('Invalid muport did')
        resolve(wrapDocument(did, doc))
      })
    })
  }
  registerMethod('muport', resolve)
}

function wrapDocument (did, muportDocument) {
  if (muportDocument.version !== 1) throw new Error('Unsupported muportDocument version')
  let doc = {
    "@context": "https://w3id.org/did/v1",
    "id": did,
    "publicKey": [{
      "id": did + "#keys-1",
      "type": "Secp256k1VerificationKey2018",
      "owner": did,
      "publicKeyHex": muportDocument.signingKey
    }, {
      "id": did + "#keys-2",
      "type": "Secp256k1ManagementKey2018",
      "owner": did,
      "publicKeyBase64": muportDocument.managementKey
    }, {
      "id": did + "#keys-3",
      "type": "Curve25519EncryptionPublicKey",
      "owner": did,
      "publicKeyBase64": muportDocument.asymEncryptionKey
    }],
    "authentication": [{
      "type": "Secp256k1SignatureAuthentication2018",
      "publicKey": did + "#keys-1"
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
