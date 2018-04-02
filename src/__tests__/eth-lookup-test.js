const ganache = require('ganache-cli')
const bs58 = require('bs58')
const EthereumClaimsRegistryAbi = require('ethereum-claims-registry').registry.abi
const RevokeAndPublishAbi = require('ethereum-claims-registry').applications.RevokeAndPublish.abi
const deployData = require('./deployData.json')
const Web3 = require('web3')
const promisifyAll = require('bluebird').promisifyAll

const ethLookup = require('../eth-lookup.js')

const TEST_HASH = 'QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmP1'
const RPC_PROV_URL = 'http://localhost:8555'
const CLAIM_KEY = 'muPortDocumentIPFS1220'
const KP = {
  secret: '0x9319b830b14712bd4ab7ede3cef7bfe7f752c5ed8cf66d099a5a14e895c6dceb',
  public: '0291888f1c8cff90aea41cf97dc9b015f2185983524a5e6df888401565239d4d8a',
  address: '0xC94629D67851E1CA43961c3B17964Db3e0b02FFB'
}

describe('MuPort', () => {

  let recoveredId4
  let server
  let web3
  let accounts
  let revAndPub

  beforeAll(async () => {
    server = promisifyAll(ganache.server({accounts: [{
      secretKey: KP.secret,
      balance: '0x9999999999999999999999999'
    }]}))
    await server.listenAsync(8555)
    web3 = new Web3(server.provider)
    web3.eth = promisifyAll(web3.eth)
    accounts = await web3.eth.getAccountsAsync()
    await deploy(deployData.EthereumClaimsRegistry)
    await deploy(deployData.RevokeAndPublish)
    const RevokeAndPublish = web3.eth.contract(RevokeAndPublishAbi)
    revAndPub = promisifyAll(RevokeAndPublish.at(deployData.RevokeAndPublish.contractAddress))
  })

  it('lookups an ipfs hash from ethereum registry correctly', async () => {
    let hash = await ethLookup(KP.public, RPC_PROV_URL)
    expect(hash).toEqual(null)

    const encHash = encodeIpfsHash(TEST_HASH)
    let txHash = await revAndPub.publishAsync(KP.address, CLAIM_KEY, encHash, {from: KP.address})
    let receipt = await web3.eth.getTransactionReceiptAsync(txHash)
    let h = await revAndPub.lookupAsync(KP.address, CLAIM_KEY)

    hash = await ethLookup(KP.public, RPC_PROV_URL)
    expect(hash).toEqual(TEST_HASH)
  })

  afterAll(() => {
    server.close()
  })

  const deploy = async deployData => {
    await web3.eth.sendTransactionAsync({from: accounts[0], to: deployData.senderAddress, value: web3.toWei(deployData.costInEther, 'ether')})
    let txHash = await web3.eth.sendRawTransactionAsync(deployData.rawTx)
    let receipt = await web3.eth.getTransactionReceiptAsync(txHash)
  }
})

const encodeIpfsHash = (hash) => {
  return '0x' + bs58.decode(hash).toString('hex').slice(4)
}

