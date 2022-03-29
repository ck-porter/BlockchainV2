const SHA256 = require("crypto-js/sha256");

//add a new class to handle transactions 
class Transaction{

    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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

   //this will create new transactions that get pushed into the pending array
   createTransaction(transaction){

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


//// ----------------------------------PART 1 Simple Crypto --------------------------
//// create an instance of the blockchain
let inft3075Coin = new Blockchain();

////create transactions -- address1 and address2 would be the public key of someones wallet
inft3075Coin.createTransaction(new Transaction('address1', 'address2', 100));
inft3075Coin.createTransaction(new Transaction('address2', 'address1', 50));

////start the miner to create a block for them to store the transactions in

console.log('\nStarting the miner...');
inft3075Coin.minePendingTransactions('nscc-address');

////the mining reward is added to the pending transactions, so nscc won't get their reward until
////another block is mined
console.log("Balance of nscc is: ", inft3075Coin.getBalanceOfAddress('nscc-address'));

////mine a second block!
console.log('\nStarting the miner again...');
inft3075Coin.minePendingTransactions('nscc-address');
console.log("Balance of nscc is: ", inft3075Coin.getBalanceOfAddress('nscc-address'));