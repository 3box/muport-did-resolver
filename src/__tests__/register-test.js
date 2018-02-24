import resolve from 'did-resolver'
import IPFS from 'ipfs-mini';
// TODO - use a real µPort did here
const docPerson = {
  '@context': 'https://w3id.org/did/v1',
  'id': 'did:muport:QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW',
  'publicKey': [{
    'id': 'did:muport:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX#keys-1',
    'type': 'EcdsaPublicKeySecp256k1',
    'owner': 'did:muport:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX',
    'publicKeyHex': '04613bb3a4874d27032618f020614c21cbe4c4e4781687525f6674089f9bd3d6c7f6eb13569053d31715a3ba32e0b791b97922af6387f087d6b5548c06944ab062'
  }, {
    'id': 'did:muport:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX#keys-2',
    'type': 'Curve25519EncryptionPublicKey',
    'owner': 'did:muport:2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX',
    'publicKeyBase64': 'QCFPBLm5pwmuTOu+haxv0+Vpmr6Rrz/DEEvbcjktQnQ='
  }]
}
IPFS.prototype.catJSON = (hash, cb) => {
  if (hash === 'QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW') {
    cb(null, docPerson)
  } else {
    cb('Error: blablabla')
  }
}
import register from '../register'



describe('µPortResolver', () => {
  describe('resolve', () => {

    describe('valid DID docs', async () => {
      it('resolves document', async () => {
        register()
        await expect(resolve('did:muport:QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW')).resolves.toEqual(docPerson)
      })
    })

    describe('error handling', () => {
      it('rejects promise', async () => {
        register()
        await expect(resolve('did:muport:tmaZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmxs')).rejects.toEqual('Invalid muport did')
      })
    })
  })
})
