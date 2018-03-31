import { registerMethod } from 'did-resolver'
import { applications } from 'ethereum-claims-registry'
import IPFS from 'ipfs-mini'
import { promisifyAll } from 'bluebird'
import keccak from 'keccak'
import bs58 from 'bs58'

const PROVIDER_URL = 'https://mainnet.infura.io'


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

    const newHash = ethLookup(doc.managementKey, opts.rpcProviderUrl)

    return wrapDocument(did, doc)
  }
  registerMethod('muport', resolve)
}


async function ethLookup (managementKey, rpcUrl) {
  const registryAddress = applications.RevokeAndPublish.networks[1].address
  const address = pubToAddr(managementKey)
  const callData = createCallData(address)
  const hexHash = await rpcRequest(rpcUrl, registryAddress, callData)
  return hexToIpfsHash(hexHash)
}

const pubToAddr = publicKeyHex => '0x' + keccak(publicKeyHex).digest().toString('hex').slice(12)
const hexToIpfsHash = hexHash => bs58.encode(Buffer.from('1220' + hexHash.slice(2), 'hex'))
// a method call to 'lookup' with the claim key 'muPortDocumentIPFS1220'
const createCallData = addr => '0x5dd4a65f000000000000000000000000' + addr.slice(2) + '6d75506f7274446f63756d656e74495046533132323000000000000000000000'

function rpcRequest (rpcUrl, registryAddress, callData) {
  const request = new XMLHttpRequest()
  return new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.timeout !== 1) {
        if (request.status !== 200) {
          reject(`[muport-did-resolver] status ${request.status}: ${request.responseText}`)
        } else {
          try {
            resolve(JSON.parse(request.responseText).result)
          } catch (jsonError) {
            reject(`[muport-did-resolver] while parsing data: '${String(request.responseText)}', error: ${String(jsonError)}`)
          }
        }
      }
    }
    request.open('POST', rpcUrl)
    request.setRequestHeader('accept', 'application/json')
    request.setRequestHeader('Content-Type', `application/json`)
    request.send(JSON.stringify({
        method: 'eth_call',
        params: [
          {to: registryAddress, data: callData},
          'latest'
        ],
        id: 1,
        jsonrpc: '2.0'
      }
    ))
  })
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
