//this library will allow us to generate a public and private key
//also methods to sign something and verify signature
//npm install elliptic
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//generate keys
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key: ' + privateKey);

console.log();
console.log('Public key: ' + publicKey);