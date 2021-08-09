# ⚠️ ⚠️ This project is no longer supported ⚠️ ⚠️ 
> 3box.js and related tools built by 3Box Labs are deprecated and no loger supported. Developers are encurraged to build with https://ceramic.network which is a more secure and decentralized protocol for sovereign data.


# µPort DID Resolver

[![Greenkeeper badge](https://badges.greenkeeper.io/3box/muport-did-resolver.svg)](https://greenkeeper.io/)

This library is intended to resolve µPort DID documents. µPort is a thin identity protocol that uses ipfs and ethereum to publish and rotate the cryptographic keys used by an identity. Currently it only supports creating and resolving identities, but not updating them.

It supports the proposed [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) spec from the [W3C Credentials Community Group](https://w3c-ccg.github.io).

It requires the `did-resolver` library, which is the primary interface for resolving DIDs.

## Resolving a DID document

A µPort resolver is created by passing an IPFS instance to the `getResolver()` function. To use the resolver returned, it must be passed to a `did-resolver` instance during instantiation, for example:

```js
import { Resolver } from 'did-resolver'
import { getResolver } from 'muport-did-resolver'

const muportResolver = getResolver(ipfs)
const resolver = new Resolver(muportResolver)

resolver.resolve('did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV').then(doc => console.log)

// You can also use ES7 async/await syntax
const doc = await resolver.resolve('did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV')
```

See the [did-resolver docs](https://github.com/decentralized-identity/did-resolver) for more general usage information on DID resolvers.

Result:
```js
{ '@context': 'https://w3id.org/did/v1',
  id: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV',
  publicKey:
   [ { id: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#signingKey',
       type: 'Secp256k1VerificationKey2018',
       owner: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV',
       publicKeyHex: '02756bca1edf0d0e263851b95e7963b4721d82c2e84c9d7f8a380f899dff8f721c' },
     { id: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#managementKey',
       type: 'Secp256k1VerificationKey2018',
       owner: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV',
       publicKeyHex: '0214ca1c21dfa6bb2550a8559e83817ebd82cfbb8dbda56757f4c0517dde9c52ff' },
     { id: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#encryptionKey',
       type: 'Curve25519EncryptionPublicKey',
       owner: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV',
       publicKeyBase64: 'uYGr6nD/c/2hQ3hNFrWUWAdlNoelPqduYyyafrALf2U=' } ],
  authentication:
   [ { type: 'Secp256k1SignatureAuthentication2018',
       publicKey: 'did:muport:QmRhjfL4HLdB8LovGf1o43NJ8QnbfqmpdnTuBvZTewnuBV#signingKey' } ],
  muportData: { nym: 'lala', symEncryptedData: {} } }
```

## Maintainers
[@oed](https://github.com/oed)
