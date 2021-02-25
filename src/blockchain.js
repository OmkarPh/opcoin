import { v4 as uuidv4 } from 'uuid';

// Utility modules
import pow from './utils/pow.js'
import isValidChain from './utils/isValid.js';
import hashedChain from './utils/hashedChain.js';


// File-based caching
import flatCache from 'flat-cache';
const cache = flatCache.load('majorcache');

// PubSub networking utitlity
import PubSub from './utils/pubsub.js';
import {CHANNELS, KEYWORDS} from './utils/pubsub.js';


// Constants
import { INIT_LISTEN, MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

// Classes
import Block from './classes/Block.js';
import Transaction from './classes/Transaction.js';


// Major object
class Blockchain{
    constructor(){
        this.chain = [];
        this.mempool = [];
        this.nodeAddress = uuidv4().replace('-','');
        try{
            this.blockchainPubsub = new PubSub([CHANNELS.OPCOIN]);
            this.mempoolPubsub = new PubSub([CHANNELS.OPCOIN_MEMPOOL]);
            this.newNodePubsub = new PubSub([CHANNELS.NEW_NODE_REQUESTS]);
            this.blockchainPubsub.addListener(this.receiveUpdatedChain.bind(this));
            
            // Retrieve blockchain from previous boot up
            this.receiveUpdatedChain(cache.getKey('blockchain'));
            
            // Add temporary listener and request blockchain updates
            this.newNodePubsub.addListener(msgObject=>{
                console.log('Publishing the chain to needies ', msgObject);
                this.newNodePubsub.publish({
                    title: "Init chain", 
                    description: this.chain
                }, CHANNELS.NEW_NODE_RESPONSES);
            })
            this.newNodePubsub.publish(KEYWORDS.REQUEST_INIT_CHAIN, CHANNELS.NEW_NODE_REQUESTS);

            // Subscribe to new node responses
            let tempPubsub = new PubSub([CHANNELS.NEW_NODE_RESPONSES])
            tempPubsub.addListener(this.receiveUpdatedChain.bind(this));

            // Listening to responses for {INIT_LISTEN} time period and then unsubscribe to init chain
            setTimeout(()=>{
                console.log('Unsubscribing and terminating init process');
                if(tempPubsub)
                    tempPubsub.unsubscribeAll();            
            }, INIT_LISTEN);

        }catch(e){
            console.log(e)
            console.log("Something weird happened while creating Blockchain object");
        }
    }
    getLength(){ 
        return this.chain.length;
    }
    getChain(){
        if(this.chain.length == 0)
            return [];
        return  this.chain; 
    }
    getMempool(page){
        let len = this.mempool.length;
        if(len <= ENTRIES_PER_PAGE || !page)
            return  {
                page: 1,
                length: len,
                maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
                mempool: this.mempool
            };

        let startIndex = ENTRIES_PER_PAGE * (page-1);
        let endIndex = ENTRIES_PER_PAGE * page;
        
        // Both indices Out of bounds, in such case return as per ?page=1
        if(startIndex<0 && endIndex<=0){
            startIndex = 0;
            endIndex = ENTRIES_PER_PAGE*1;
            page = 1;
        }

        // If only endIndex is out of bound, then make it max
        if(endIndex > len)  endIndex = len;

        return {
            page,
            length: len,
            maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
            mempool: this.mempool.slice(startIndex, endIndex)
        };
    }
    getChainWithHashes(page){
        return hashedChain(page, this.chain);
    }
    isValid(chainToValidate){
        if(!chainToValidate)    chainToValidate = this.chain;
        return isValidChain(chainToValidate);
    }
    getLastBlock(){ 
        if(this.chain.length == 0)
            return null;
        return this.chain[this.chain.length -1] 
    }
    createBlock(transactions, proof, prevHash, length){
        if(transactions.length > MAX_TRANSACTIONS)
            throw new Error("Max transaction size reached");
        const newBlock = new Block(length+1, Date.now().toString(), transactions, proof, prevHash);
        return newBlock;
    }
    copyChain(newChain){
        if(newChain == null || newChain.length == 0)    return false;
        
        let tempChain = [];

        try{
            for(let {timestamp, transactions, nonce, prevHash} of newChain){
                const newBlock = new Block(tempChain.length+1, timestamp, transactions, nonce, prevHash);
                tempChain.push(newBlock);
            }
            if(isValidChain(tempChain)){
                this.chain = tempChain;

                // Storing updated chain into cache
                cache.setKey('blockchain', this.chain);
                cache.save();

                return true;
            }
            return false;
        }catch(e){
            console.error("Error ocurred while copying new synced chain!!");
            console.error(e);
            return false;
        }
    }
    receiveUpdatedChain(newChain){
        try{
            let blockchain = this;
            if(!newChain)   return;

            // Copy newly published chain only if it is greater than own chain
            if(newChain.length > blockchain.chain.length){
                if(blockchain.copyChain(newChain))
                    console.log('Copied newly published chain of length', newChain.length);
                else
                    console.log('Received an invalid newly published chain of length', newChain.length);
            }else
                console.log('Received a shorter newly published chain of length', newChain.length);
            
        }catch(e){
            console.log(e);
            console.log('Something weird happened when received new blockchain !');
        }
    }
    mineBlock(){
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
            
            // Storing chain into cache
            cache.setKey('blockchain', this.chain);
            cache.save();

            // Remove mined transactions
            this.mempool.splice(0, transactions.length);
            
            // Gift opcoins to miner
            this.addTransaction({
                sender: this.nodeAddress,
                receiver: 'Omkar',
                amount: 0.5,
                fee: 0.00
            });

            this.blockchainPubsub.publish({
                title: "New block", 
                description: this.chain
            })
            .catch(err => {
                console.log(err);
                console.log('Something wrong happened while publishing newly mined chain !');
            });

            return this.getLastBlock().number;
        }catch(e){
            console.log(e);
            console.log("Max transactions reached !!");
            return -1;
        }
    }
    proofOfWork(transactions, prevHash){
        return pow(transactions, prevHash, this.createBlock, this.chain.length);
    }
    addTransaction({sender, receiver, fee, amount}){
        let newTransaction = new Transaction(sender, receiver, amount, fee);
        if(!newTransaction.isValid()) return -1;
        this.mempool.push(newTransaction);
        return newTransaction.id;
    }
    syncMempool(){
        return false;
    }
}


const blockchain = new Blockchain();

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

for(let [sender, receiver, amount, fee] of initTransactions)
    blockchain.addTransaction({sender, receiver, amount, fee});
for(let [sender, receiver, amount, fee] of initTransactions)
    blockchain.addTransaction({sender, receiver, amount, fee});

if(process.env.NODE_ENV !== 'production' && process.argv[3] === 'dummy')
    for(let i=0; i<2; i++)    blockchain.mineBlock();

export default blockchain;