const SHA256 = require("crypto-js/sha256");

class Block{
    constructor(index, timestamp, data, previousHash=''){

        //index is option, timestamp for when block was created, 
        //data (can be anything, in this case how much money was transfered to who and from who),
        //previous hash has 
        //the has from the block before it

        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();

        //this nounce is used for mining blocks, because a block cannot be changed and
        //there needs to be a way to break out from the while loop bellow 
        this.nounce = 0;
    }

    calculateHash(){
        //take the properties of the block, run through hash function, return the hash
        //import crypto-js (hash function) using terminal and npm
        //this becomes our id

        return SHA256(this.index + this.previousHash + this.timestamp +
             JSON.stringify(this.data) + this.nounce).toString();

    }

    //difficulty is set so there is a steady stream of new blocks
    //bitcoin aims to add 1 block per 10 mins. This is controlled by the difficulty variable
    mineBlock(difficulty){

        //this will determine how hard it is to mine a coin
        //take the substring starting at index 0 and going to index difficulty
        //keep looping until the hash has the correct number of 0's in front of it
        while(this.hash.substring(0, difficulty) !== Array(difficulty +1).join("0")){

            this.nounce ++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}

class Blockchain{
    constructor(){

        //an array of blocks on the blockchain
        //the first block is called a genesis block which is added manually
        this.chain = [this.createGenesisBlock()];

        //difficulty is how long it will take a computer to generate a hash
        //the difficulty is how many zeros are out front of the hash
        //this.difficulty = 2;

        //harder difficulty increases the time taken to mine a block
        this.difficulty = 5;
    }

    createGenesisBlock(){

        //this is the first block on the chain, it's data is simply a string stating
        //genesis block, index of 0, previous hash of 0 because it's the first block
        return new Block(0, "01/01/2022", "Genesis block", 0);
    }

    getLastestBlock(){

        //gets the last chain in the block
        return this.chain[this.chain.length -1];
    }

    addBlock(newBlock){

        //set the previous hash for the new block to the hash of the lastest block
        newBlock.previousHash = this.getLastestBlock().hash;

        //create a new block by mining it, we need to pass it the difficulty
        newBlock.mineBlock(this.difficulty);

        //add block to chain --simple example, usually there are many checks a block must
        //go through before being added to the chain
        this.chain.push(newBlock);
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

//create an instance of the blockchain
let inft3075Coin = new Blockchain();



//------------------------PART 1  CHECK CHAIN -----------------------------------------------------------------
////print out the block chain and it's data

////add some blocks
// inft3075Coin.addBlock(new Block(1, "01/01/2022", {amount: 4} ))
// inft3075Coin.addBlock(new Block(2, "02/01/2022", {amount: 2} ))
// inft3075Coin.addBlock(new Block(3, "04/01/2022", {amount: 6} ))

// console.log(JSON.stringify(inft3075Coin, null, 4));
// console.log("Is block chain valid? " + inft3075Coin.isChainValid());

// ////tamper with one of the blocks, ie - invalidate the chain
// console.log("\nNow we tamper with the chain by changing the data in the block");
// inft3075Coin.chain[1].data = {amount: 100};
// console.log("\nIs block chain valid? " + inft3075Coin.isChainValid());

// console.log("\nNow we will try to repair the modification by recalculating the hash to include the data change");
// inft3075Coin.chain[1].hash = inft3075Coin.chain[1].calculateHash();

// console.log("\nIs block chain valid? " + inft3075Coin.isChainValid());
// console.log(JSON.stringify(inft3075Coin, null, 4));

// console.log("\nThe chain is still invalid because the next block contains the wrong previous hash.");
// console.log("Technically a developer could re-calculate all the hashes but we will check for that too.");

//------------------------PART 2  PROOF OF WORK (MINING) -----------------------------------------------------------------

console.log("Mining block 1...")
inft3075Coin.addBlock(new Block(1, "01/01/2022", {amount: 4} ))

console.log("Mining block 2...")
inft3075Coin.addBlock(new Block(2, "02/01/2022", {amount: 2} ))

console.log("Mining block 3...")
inft3075Coin.addBlock(new Block(3, "04/01/2022", {amount: 6} ))


