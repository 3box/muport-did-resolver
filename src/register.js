import { registerMethod } from 'did-resolver'
import IPFS from 'ipfs-mini'

function register (ipfsConf) {
  const conf = ipfsConf || { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }
  const ipfs = new IPFS(conf)

  async function resolve (did, parsed) {
    // since we don't support UPDATE operation yet we only fetch the document from ipfs
    return new Promise((resolve, reject) => {
      ipfs.catJSON(parsed.id, (err, doc) => {
        if (err) reject('Invalid muport did')
        resolve(doc)
      })
    })
  }
  registerMethod('muport', resolve)
}

module.exports = register
