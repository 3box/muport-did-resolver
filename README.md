# µPort DID Resolver

This library is intended to resolve µPort DID documents. µPort is a thin identity protocol that uses ipfs and ethereum to publish and rotate the cryptographic keys used by an identity. Currently it only supports creating and resolving identities, but not updating them.

It supports the proposed [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/) spec from the [W3C Credentials Community Group](https://w3c-ccg.github.io).

It requires the `did-resolver` library, which is the primary interface for resolving DIDs.

## Resolving a DID document

The resolver presents a simple `resolver()` function that returns a ES6 Promise returning the DID document.

```js
import resolve from 'did-resolver'
import registerResolver from 'muport-did-resolver'

registerResolver()

resolve('did:muport:QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW').then(doc => console.log)

// You can also use ES7 async/await syntax
const doc = await resolve('did:muport:QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW')
```

