const XMLHttpRequest = (typeof window !== 'undefined') ? window.XMLHttpRequest : require('xmlhttprequest').XMLHttpRequest

const IPFS_CONF = { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }

async function ipfsLookup (hash, conf) {
  conf = conf || IPFS_CONF
  const url = conf.protocol + '://' + conf.host + '/ipfs/' + hash
  return request(url)
}

function request (url, payload) {
  const request = new XMLHttpRequest()
  return new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.timeout !== 1) {
        if (request.status !== 200) {
          reject(`[muport-did-resolver] status ${request.status}: ${request.responseText}`)
        } else {
          try {
            resolve(JSON.parse(request.responseText))
          } catch (jsonError) {
            reject(`[muport-did-resolver] while parsing data: '${String(request.responseText)}', error: ${String(jsonError)}`)
          }
        }
      }
    }
    if (payload) {
      request.open('POST', url)
      request.setRequestHeader('Content-Type', `application/json`)
    } else {
      request.open('GET', url)
    }
    request.setRequestHeader('accept', 'application/json')
    request.send(payload)
  })
}

module.exports = { ipfsLookup }
