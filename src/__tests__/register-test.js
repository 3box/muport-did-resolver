import resolve from 'did-resolver'
import IPFS from 'ipfs-mini';
// TODO - use a real µPort did here
const muportDoc = {"version":1,"signingKey":"02756bca1edf0d0e263851b95e7963b4721d82c2e84c9d7f8a380f899dff8f721c","managementKey":"0214ca1c21dfa6bb2550a8559e83817ebd82cfbb8dbda56757f4c0517dde9c52ff","asymEncryptionKey":"uYGr6nD/c/2hQ3hNFrWUWAdlNoelPqduYyyafrALf2U=","publicProfile":{"name":"lala"},"symEncryptedData":{}}
const didDoc = {
  "@context": "https://w3id.org/did/v1",
  "authentication": [{
    "publicKey": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#signingKey",
    "type": "Secp256k1SignatureAuthentication2018"
  }],
  "id": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV",
  "muportData": {"nym": "lala", "symEncryptedData": {}},
  "publicKey": [{
    "id": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#signingKey",
    "owner": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV",
    "publicKeyHex": "02756bca1edf0d0e263851b95e7963b4721d82c2e84c9d7f8a380f899dff8f721c",
    "type": "Secp256k1VerificationKey2018"
  }, {
    "id": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#managementKey",
    "owner": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV",
    "publicKeyHex": "0214ca1c21dfa6bb2550a8559e83817ebd82cfbb8dbda56757f4c0517dde9c52ff",
    "type": "Secp256k1VerificationKey2018"
  }, {
    "id": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#encryptionKey",
    "owner": "did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV",
    "publicKeyBase64": "uYGr6nD/c/2hQ3hNFrWUWAdlNoelPqduYyyafrALf2U=",
    "type": "Curve25519EncryptionPublicKey"
  }]
}
IPFS.prototype.catJSON = (hash, cb) => {
  if (hash === 'QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV') {
    cb(null, muportDoc)
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
        await expect(resolve('did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV')).resolves.toEqual(didDoc)
      })
    })

    describe('error handling', () => {
      it('rejects promise', async () => {
        register()
        await expect(resolve('did:muport:tmaZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmxs')).rejects.toThrow('Invalid muport did')
      })
    })
  })
})
