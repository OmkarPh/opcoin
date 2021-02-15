import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'Nope';       // Bypass localtunnel interceptor

// Utility modules
import hasher from './utils/hash.js';


// Constants
import { DIFFICULTY_ZEROES, MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

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
    getChain: async function(){
        await this.syncChain(); 
        if(this.chain.length == 0)
            return [];
        return  this.chain; 
    },
    getMempool: function(){
        if(this.mempool.length == 0)
            return [];
        return this.mempool;
    },
    getChainWithHashes: async function(page){ 
        await this.syncChain();
        let len = this.chain.length;
        if(this.chain.length <= ENTRIES_PER_PAGE || !page)
            return  {
                page: 1,
                length: len,
                maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
                chain: this.chain.map(block => ({...block, hash: block.hashSelf()}))
            };


        // if((len - ENTRIES_PER_PAGE * page && ) < 0) page = 1;

        let startIndex = len - ENTRIES_PER_PAGE * page;
        let endIndex = len - (ENTRIES_PER_PAGE * (page-1));
        
        // Out of bounds, in such case return as per ?page=1
        if(startIndex<0 && endIndex<=0){
            startIndex = len - ENTRIES_PER_PAGE * 1;
            endIndex = len;
            page = 1;
        }

        // If only startIndex is out of bound, then make it 0
        if(startIndex < 0)  startIndex = 0;
        return {
            page,
            length: len,
            maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
            chain: this.chain.slice(startIndex, endIndex).reverse().map(block => ({...block, hash: block.hashSelf()}))
        };
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
            hash = currBlock.hashSelf();
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
        return newBlock;
    },
    copyBlock: function({transactions, timestamp, proof, prevHash}){
        const newBlock = new Block(this.chain.length+1, timestamp, transactions, proof, prevHash);
        this.chain.push(newBlock);
    },
    copyChain: function(newChain){
        if(newChain == null || newChain.length == 0)    return false;
        let oldChain = this.chain;
        this.chain = [];
        try{
            for(let {transactions, timestamp, proof, prevHash} of newChain){
                const newBlock = new Block(this.chain.length+1, timestamp, transactions, proof, prevHash);
                this.chain.push(newBlock);
            }
        }catch(e){
            console.error("Error ocurred while copying new synced chain!!");
            console.error(e);
            return false;
        }
        return true;
    },
    mineBlock: function(){
        if(this.mempool.length == 0)
            return 0;

        // Target transactions with highest fees
        let transactions = this.mempool.sort(Transaction.sortDescending).slice(0, MAX_TRANSACTIONS);

        try{
            let lastBlock = this.getLastBlock();
            if(lastBlock == null)
                this.chain.push(this.proofOfWork(transactions, 0));
            else
                this.chain.push(this.proofOfWork(transactions, lastBlock.hashSelf()));
                // blockchain.createBlock(
                //     transactions, 
                //     this.proofOfWork(transactions, lastBlock.hashSelf()), 
                //     lastBlock.hashSelf(),
                //     true
                // );
            
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
    proofOfWork: function(transactions, prevHash){
        let newNonce = 0;
        let isValidProof = false;
        let currentBlock = null;
        while(!isValidProof){
            currentBlock = this.createBlock(transactions, newNonce, prevHash);
            if(currentBlock.hashSelf().substr(0, 3) == DIFFICULTY_ZEROES)
                isValidProof = true
            else{
                // Simplest computation
                newNonce += 1;           

                // Get newProof as its increment or some random value, this makes it jump way across and get very random proofs
                // newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(999999999));        

                // Get very random proofs in larger range
                // newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));       
            }
        }
        return currentBlock;
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
    syncChain: async function(){
        let selfChain = this.chain;
        let maxLen = this.chain.length;
        let biggerChain  = undefined;
        try{
            for(let node of this.nodes){
                const url = new URL(node);
                try{
                    const response = await axios.get(`http://${url.hostname}:${url.port}/blockchain`);
                    if(response.data.length > maxLen){
                        maxLen = response.data.length;
                        biggerChain = response.data.chain;
                    }
                }catch(err){
                    // Handles situations when the concerned node is offline, this is very common scenario, hence not logged
                }finally{
                    continue;
                }
            }
            if(biggerChain){
                this.copyChain(biggerChain);
                console.log("Blockchain synced -\\-")
                return true;
            }
        }catch(err){
            console.error(err);
            console.log("Error occured while syncing blockchain from other nodes.Not a network issue !");
            return false;
        }
        return false;
    },
    syncMempool: async function(){
        return false;
    }
}

// Blockchain initializer
const initTransactions = [
    ["gp", "op", 34, 0.0005],
    ["pp", "op", 9, 0.00002],
    ["pp", "op", 3, 0.0002],
    ["op", "gp", 67, 0.0015], 
    ["op", "gp", 125, 0.525], 
    ["op", "pp", 234, 0.845],
    ["pp", "op", 69, 0.062],
    ["pp", "op", 300, 1.052],
];
for(let transaction of initTransactions)
    blockchain.mempool.push(new Transaction(...transaction));
// console.log("Mempool:\n", blockchain.mempool);
// console.log("Blockchain:\n", blockchain.getChain());
// console.log("Blockchain validity:", blockchain.isValid());
// blockchain.mineBlock();
// blockchain.addNode('http://localhost:5001/');
// blockchain.addNode('http://localhost:5002/');
// console.log(await blockchain.syncChain());
// console.log(await blockchain.syncChain());

if(process.env.NODE_ENV !== 'production')
    for(let i=0; i<53; i++)    blockchain.mineBlock();

export default blockchain;