import { applications } from 'ethereum-claims-registry'
import EthUtils from 'ethereumjs-util'
import bs58 from 'bs58'
const XMLHttpRequest = (typeof window !== 'undefined') ? window.XMLHttpRequest : require('xmlhttprequest').XMLHttpRequest

const PROVIDER_URL = 'https://mainnet.infura.io'
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'


async function ethLookup (managementKey, rpcUrl = PROVIDER_URL) {
  const registryAddress = applications.RevokeAndPublish.networks[1].address
  const address = EthUtils.pubToAddress(Buffer.from(managementKey, 'hex'), true).toString('hex')
  const callData = createCallData(address)
  const hexHash = await rpcRequest(rpcUrl, registryAddress, callData)
  return hexHash === ZERO_HASH ? null : hexToIpfsHash(hexHash)
}

const hexToIpfsHash = hexHash => bs58.encode(Buffer.from('1220' + hexHash.slice(2), 'hex'))
// a method call to 'lookup' with the claim key 'muPortDocumentIPFS1220'
const createCallData = addr => '0x5dd4a65f000000000000000000000000' + addr + '6d75506f7274446f63756d656e74495046533132323000000000000000000000'

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

module.exports = ethLookup
