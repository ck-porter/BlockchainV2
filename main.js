const{Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//create new instance 
let inft3075Coin = new Blockchain();

//set my keys up
const myKey = ec.keyFromPrivate('c271237fb892ef59ec229c4274c8f4585b55377f9a0beb4ada22d88f58c1b19a');
const myWalletAddress = myKey.getPublic('hex');

//start the miner to create a block for them to store the transactions in
//remember that the reward is applied to the NEXT block that is mined
console.log('\nStarting the miner...');
inft3075Coin.minePendingTransactions(myWalletAddress);

//create a transaction to send 10 coins
const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
inft3075Coin.addTransaction(tx1);

//mine a second block! and check the balance
console.log('\nStarting the miner again...');
inft3075Coin.minePendingTransactions('nscc-address');
console.log("Balance of nscc is: ", inft3075Coin.getBalanceOfAddress(myWalletAddress));





