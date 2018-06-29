const ganache = require('ganache-cli')
const bs58 = require('bs58')
const EthrDIDRegistryAbi = require('ethr-did-registry').abi
const Web3 = require('web3')
const promisifyAll = require('bluebird').promisifyAll

const { ethLookup, ethrLookup } = require('../lookup.js')

const TEST_HASH_1 = 'QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmP1'
const TEST_HASH_2 = 'QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmP2'
const RPC_PROV_URL = 'http://localhost:8555'
const CLAIM_KEY = 'muPortDocumentIPFS1220'
const KP = {
  secret: '0x9319b830b14712bd4ab7ede3cef7bfe7f752c5ed8cf66d099a5a14e895c6dceb',
  public: '0291888f1c8cff90aea41cf97dc9b015f2185983524a5e6df888401565239d4d8a',
  address: '0xC94629D67851E1CA43961c3B17964Db3e0b02FFB'
}
const deployData = require('../../src/__tests__/deployData.json')

describe('MuPort', () => {

  let recoveredId4
  let server
  let web3
  let accounts
  let ethrRegistry

  beforeAll(async () => {
    server = promisifyAll(ganache.server( {accounts: [{ secretKey: KP.secret, balance: '0x9999999999999999999999999' }]}))
    await server.listenAsync(8555)
    web3 = new Web3(server.provider)
    web3.eth = promisifyAll(web3.eth)
    await deploy(deployData.EthereumDIDRegistry)
    const EthrDIDRegistry = web3.eth.contract(EthrDIDRegistryAbi)
    ethrRegistry = promisifyAll(EthrDIDRegistry.at(deployData.EthereumDIDRegistry.contractAddress))
  })

  it('should return null if no updates', async () => {
    let hash = await ethrLookup(KP.public, RPC_PROV_URL)
    expect(hash).toEqual(null)
    hash = await ethrLookup(KP.address, RPC_PROV_URL)
    expect(hash).toEqual(null)
  })

  it('should return null if events are published with the wrong key', async () => {
    const encHash = encodeIpfsHash(TEST_HASH_1)
    await ethrRegistry.setAttributeAsync(KP.address, 'wrongKey', encHash, 0, {from: KP.address})
    const hash = await ethrLookup(KP.public, RPC_PROV_URL)
    expect(hash).toEqual(null)
  })

  it('should return an ipfs hash from ethr-did-registry correctly', async () => {
    const encHash = encodeIpfsHash(TEST_HASH_1)
    await ethrRegistry.setAttributeAsync(KP.address, CLAIM_KEY, encHash, 0, {from: KP.address})
    let hash = await ethrLookup(KP.public, RPC_PROV_URL)
    expect(hash).toEqual(TEST_HASH_1)
    hash = await ethrLookup(KP.address, RPC_PROV_URL)
    expect(hash).toEqual(TEST_HASH_1)
  })

  it('should return an new ipfs hash when updated', async () => {
    const encHash = encodeIpfsHash(TEST_HASH_2)
    await ethrRegistry.setAttributeAsync(KP.address, CLAIM_KEY, encHash, 0, {from: KP.address})
    let hash = await ethrLookup(KP.public, RPC_PROV_URL)
    expect(hash).toEqual(TEST_HASH_2)
    hash = await ethrLookup(KP.address, RPC_PROV_URL)
    expect(hash).toEqual(TEST_HASH_2)
  })

  afterAll(() => {
    server.close()
  })

  const deploy = async deployData => {
    await web3.eth.sendTransactionAsync({from: KP.address, to: deployData.senderAddress, value: web3.toWei(deployData.costInEther, 'ether')})
    let txHash = await web3.eth.sendRawTransactionAsync(deployData.rawTx)
    let receipt = await web3.eth.getTransactionReceiptAsync(txHash)
  }
})

const encodeIpfsHash = (hash) => {
  return '0x' + bs58.decode(hash).toString('hex').slice(4)
}
