import { v4 as uuidv4 } from 'uuid';


// Utility modules
import hasher from './utils/hash.js';


// Constants
import { DIFFICULTY_ZEROES, MAX_TRANSACTIONS } from './CONSTANTS/index.js';
console.log("Mining difficulty: ", DIFFICULTY_ZEROES)

// Classes
import Block from './classes/Block.js';
import Transaction from './classes/Transaction.js';


// Major object
const blockchain = {
    chain: [],
    mempool: [],
    nodes: new Set(),
    nodeAddress: uuidv4().replace('-',''),

    getLength: function(){ 
        return this.chain.length;
    },
    getNodes: function(){
        return Array.from(this.nodes);
    },
    getChain: function(){ 
        if(this.chain.length == 0)
            return [];
        return  this.chain; 
    },
    getMempool: function(){
        if(this.mempool.length == 0)
            return [];
        return this.mempool;
    },
    getChainWithHashes: function(){ 
        return  this.chain.map(block => ({...block, hash: block.hashSelf()})) 
    },
    isValid: function(chain = this.chain){
        if(chain.length <= 1)  return true;

        let prevBlock = chain[0];
        let currBlock, currProof, prevProof, hash;

        for(let i = 1; i<chain.length; i++){
            currBlock = chain[i];
            if(currBlock.prevHash != prevBlock.hashSelf()){
                console.log(`Something invalid with link between block no. ${prevBlock.number} and ${currBlock.number}`)
                console.log(currBlock.number, currBlock.prevHash, prevBlock.hashSelf());
                return false;
            }
            prevProof = prevBlock.proof;
            currProof = currBlock.proof;
            hash = hasher(String(currProof*currProof - prevProof*prevProof));
            if(hash.substr(0,3) != DIFFICULTY_ZEROES)
                return false;
            prevBlock = currBlock;
        }
        return true;
    },
    getLastBlock: function(){ 
        if(this.chain.length == 0)
            return null;
        return this.chain[this.chain.length -1] 
    },
    createBlock: function(transactions, proof, prevHash){
        if(transactions.length > MAX_TRANSACTIONS)
            throw new Error("Max transaction size reached");
        const newBlock = new Block(this.chain.length+1, Date.now().toString(), transactions, proof, prevHash);
        this.chain.push(newBlock);
    },
    mineBlock: function(){
        if(this.mempool.length == 0)
            return 0;

        // Target transactions with highest fees
        let transactions = this.mempool.sort(Transaction.sortDescending).slice(0, MAX_TRANSACTIONS);

        try{
            let lastBlock = this.getLastBlock();
            if(lastBlock == null)
                blockchain.createBlock(transactions, 0, 0);
            else
                blockchain.createBlock(
                    transactions, 
                    this.proofOfWork(lastBlock.proof), 
                    lastBlock.hashSelf()
                );
            
            // Remove mined transactions
            this.mempool.splice(0, transactions.length);
            
            // Gift opcoins to miner
            this.addTransaction({
                sender: this.nodeAddress,
                receiver: 'Omkar',
                amount: 0.5,
                fee: 0.00
            });
                
            return this.getLastBlock().number;
        }catch(e){
            console.log(e);
            console.log("Max transactions reached !!");
            return -1;
        }
    },
    proofOfWork: (prevProof)=>{
        let newProof = 1;
        let isValidProof = false;
        let currentHash;
        while(!isValidProof){
            currentHash = hasher(String(newProof*newProof - prevProof*prevProof));
            if(currentHash.substr(0, 3) == '000')
                isValidProof = true
            else{
                // Simplest computation
                // newProof += 1;           

                // Get newProof as its increment or some random value, this makes it jump way across and get very random proofs
                newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(999999999));        

                // Get very random proofs in larger range
                // newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));       
            }
        }
        return newProof;
    },
    addTransaction: function({sender, receiver, fee, amount}){
        let newTransaction = new Transaction(sender, receiver, amount, fee);
        if(!newTransaction.isValid())
            return -1;
        this.mempool.push(newTransaction);
        return newTransaction.id;
    },
    addNode: function(address){
        this.nodes.add(address);
    },
    replaceChain: function(){

    }

}

// Blockchain initializer
const initTransactions = [
    ["gp", "op", 34, 0.0005],
    ["pp", "op", 9, 0.00002],
    ["op", "gp", 27, 0.025], 
    ["pp", "op", 3, 0.0002],
    ["op", "gp", 67, 0.0015], 
    ["pp", "op", 9, 0.00002],
    ["op", "gp", 125, 0.525], 
    ["op", "pp", 234, 0.845],
    ["gp", "op", 24, 0.0005],
    ["pp", "op", 69, 0.062],
    ["op", "gp", 57, 0.05], 
    ["pp", "op", 300, 1.052],
    ["op", "gp", 2, 0.00002], 
    ["pp", "op", 21, 0.005],
    ["op", "gp", 15, 0.025], 
    ["op", "pp", 75, 0.05],
];
for(let transaction of initTransactions)
    blockchain.mempool.push(new Transaction(...transaction));
// console.log("Mempool:\n", blockchain.mempool);
// console.log("Blockchain:\n", blockchain.getChain());
// console.log("Blockchain validity:", blockchain.isValid());
// blockchain.mineBlock();




export default blockchain;