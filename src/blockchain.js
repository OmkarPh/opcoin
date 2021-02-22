import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'Nope';       // Bypass localtunnel interceptor

// Utility modules
import hasher from './utils/hash.js';
import pow from './utils/pow.js'
import isValidChain from './utils/isValid.js';
import hashedChain from './utils/hashedChain.js';

// PubSub networking utitlity
import PubSub from './utils/pubsub.js';
import {CHANNELS} from './utils/pubsub.js';


// Constants
import { DIFFICULTY_ZEROES, MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

// Classes
import Block from './classes/Block.js';
import Transaction from './classes/Transaction.js';

// Major object
const blockchain = {
    chain: [],
    mempool: [],
    nodeAddress: uuidv4().replace('-',''),
    blockchainPubsub: new PubSub([CHANNELS.OPCOIN]),
    mempoolPubsub: new PubSub([CHANNELS.OPCOIN_MEMPOOL]),
    init: function(){
        this.blockchainPubsub.addListener(this.receiveUpdate.bind(this));
    },
    getLength: function(){ 
        return this.chain.length;
    },
    getChain: async function(){
        if(this.chain.length == 0)
            return [];
        return  this.chain; 
    },
    getMempool: function(page){
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
    },
    getChainWithHashes: function(page){
        return hashedChain(page, this.chain);
    },
    isValid: function(){
        return isValidChain(this.chain);
    },
    getLastBlock: function(){ 
        if(this.chain.length == 0)
            return null;
        return this.chain[this.chain.length -1] 
    },
    createBlock: function(transactions, proof, prevHash, length){
        if(transactions.length > MAX_TRANSACTIONS)
            throw new Error("Max transaction size reached");
        const newBlock = new Block(length+1, Date.now().toString(), transactions, proof, prevHash);
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
    receiveUpdate: function(messageObject){
        try{
            console.log('Message received in receive update');
            let blockchain = this;
            const {message, actualChannel, channel, publisher, subscribedChannel, subscription, timetoken} = messageObject;
            console.log(message !== null, actualChannel, channel, publisher, subscribedChannel, subscription, timetoken);

            const newChain = JSON.parse(message.description);
            // Copy newly published chain only if it is greater than own chain
            if(newChain.length > blockchain.chain.length){
                console.log('Copying chain');
                blockchain.copyChain(newChain)
                console.log('Copied chain');
            }
        }catch(e){
            console.log(e);
            console.log('Something weird happened when received new blockchain !');
        }
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
                titile: "New block", 
                description: JSON.stringify(this.chain)
            })
            .then(response => {})
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
    },
    proofOfWork: function(transactions, prevHash){
        return pow(transactions, prevHash, this.createBlock, this.chain.length);
    },
    addTransaction: function({sender, receiver, fee, amount}){
        let newTransaction = new Transaction(sender, receiver, amount, fee);
        if(!newTransaction.isValid()) return -1;
        this.mempool.push(newTransaction);
        return newTransaction.id;
    },
    syncMempool: async function(){
        return false;
    }
}
try{
    blockchain.init();
}catch(e){
    console.log(e)
    console.log("Something weird happened while intitializing");
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
for(let transaction of initTransactions)
    blockchain.mempool.push(new Transaction(...transaction));
    
if(process.env.NODE_ENV !== 'production' && process.argv[3] === 'dummy')
    for(let i=0; i<4; i++)    blockchain.mineBlock();

export default blockchain;