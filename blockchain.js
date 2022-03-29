const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//add a new class to handle transactions 
class Transaction{

    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    //this hash is what we will sign with our private key
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){

        //check to see if the public key equals the from address
        if(signingKey.getPublic('hex') !== this.fromAddress){

            throw new Error('You cannot sign transactions for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){

        //mining rewards come from null addresses, so if address is null, its a reward
        if(this.fromAddress === null) return true;

        //make sure there is a signature and not emptyu
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        //verify it was signed with the correct key by making a new object
        //from the fromAddress
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');

        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash=''){
     
        //remove the index because the order of blocks is determined by
        //their postion in the array, not the index
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
   
        this.nounce = 0;
    }

    calculateHash(){
   
        return SHA256(this.index + this.previousHash + this.timestamp +
             JSON.stringify(this.data) + this.nounce).toString();

    }

    mineBlock(difficulty){
        
        while(this.hash.substring(0, difficulty) !== Array(difficulty +1).join("0")){

            this.nounce ++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash);
    }

    //check to make sure all the transactions are valid
    hasValidTransactions(){

        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        //if all the transactions are valid, return true
        return true;
    }
}

class Blockchain{
    constructor(){

        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;

        //all transactions made inbetween blocks are temporarily stored
        //in this pendingTransactions array so they can be included in the next block
        this.pendingTransactions = [];

        //if you successfully mine a new block, you get 100 coins!! YAY!
        this.miningReward = 100;
    }

    createGenesisBlock(){

        return new Block("01/01/2022", "Genesis block", 0);
    }

    getLastestBlock(){

        //gets the last chain in the block
        return this.chain[this.chain.length -1];
    }

   //add new block method has been replaced with a minePendingTransactions    
   minePendingTransactions(miningRewardAddress){

        //when a miner calls this method, they will pass along their wallet address
        //if they are successful in mining the block, the reward goes to their wallet

        let block = new Block(Date.now(), this.pendingTransactions);  //real world, you won't add all transactions, only some

        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        //create a new transaction to send the mining rewards to the miners wallet
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
   }

   //this will add new transactions that get pushed into the pending array
   addTransaction(transaction){

        //check that the to and from addresses are filled out
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        //verify that transaction is valid
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }

        //if the above two tests pass, then you can push the new transaction into pending
        this.pendingTransactions.push(transaction);
   }

   //check the balance of a wallet address, all funds are stored 
   //in the block chain so you need to iterate over it to determine the balance
   getBalanceOfAddress(address){

        let balance = 0;
        for(const block of this.chain){
            
           for(const trans of block.transactions){

                //if the from address is your wallet address, you sent funds
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                //if the to address is your wallet address, you recieved funs
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
           } 
        }

        return balance;
   }


    isChainValid(){
        
        //start at the 2nd block because the 1st block is the genesis block
        for(let i = 1; i < this.chain.length; i++){

            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            //if every transaction isn't valid, return false
            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            //check if the hash is the same by comparing it's current hash to it's
            //calculated hash. If it's not the same it's been tampered with
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            //check if our block points to a correct previous block
            //chain is valid
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        //if none of the blocks has been tampered with, return true
        return true;
    }    

}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;