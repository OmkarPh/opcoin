import path from 'path';

import { v4 as uuidv4 } from 'uuid';

// Utility modules
import { calculateTotalFees, PubSub, isValidChain, hashedChain, pow } from './utils/index.js';
import {CHANNELS, KEYWORDS} from './utils/pubsub.js';       // PubSub networking constants

// File-based caching
import Cache from './classes/Cache.js';
const cache = new Cache('blockchain');


// Constants
import { INIT_LISTEN, MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

// Classes
import Block from './classes/Block.js';


import mempool from './mempool.js';
import utxo from './utxo.js';       // Can be removed by dependency injection Lot of drill tho

// Major object
class Blockchain{
    constructor(){
        this.chain = [];
        this.nodeAddress = uuidv4().replace('-','');
        try{
            this.blockchainPubsub = new PubSub([CHANNELS.OPCOIN]);
            this.newNodePubsub = new PubSub([CHANNELS.NEW_NODE_REQUESTS]);
            this.blockchainPubsub.addListener(this.receiveUpdatedChain.bind(this));
            
            // Retrieve blockchain from previous boot up
            this.receiveUpdatedChain(cache.getKey('blockchain'), 'cache');
            
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
                console.log(`Unsubscribing and initialization response channel after ${INIT_LISTEN}ms`);
                if(tempPubsub)
                    tempPubsub.unsubscribeAll();            
            }, INIT_LISTEN);

        }catch(e){
            console.log(e)
            console.log("Something weird happened while creating Blockchain object");
        }
    }
    getLength(){    
        return this.chain.length
    }
    getBlock(blockNo){
        if(this.chain.length == 0 || blockNo >= this.chain.length )      
            return undefined;
        return this.chain[blockNo];
    }
    getChain(){
        return  this.chain
    }
    getChainWithHashes(page){
        return hashedChain(page, this.chain)
    }
    isValid(chainToValidate=this.chain){
        // if(!chainToValidate)    chainToValidate = this.chain;
        return isValidChain(chainToValidate);
    }
    getLastBlock(){ 
        if(this.chain.length == 0)      
            return null;
        return this.chain[this.chain.length -1] 
    }
    copyChain(newChain){
        if(newChain == null || newChain.length == 0)    
            return false;
        let tempChain = [];
        try{
            for(let {height, timestamp, transactions, nonce, prevHash} of newChain){
                const newBlock = new Block(height, timestamp, transactions, nonce, prevHash);
                tempChain.push(newBlock);
            }

            // Validate chain & revamp UTXO set from new chain
            if(isValidChain(tempChain) && utxo.replaceFromChain(tempChain)){
                this.chain = tempChain;

                // Storing updated chain into cache
                cache.setKey('blockchain', this.chain);

                return true;
            }
            return false;
        }catch(e){
            console.error("Error ocurred while copying new synced chain!!");
            console.error(e);
            return false;
        }
    }
    receiveUpdatedChain(newChain, source='network'){
        try{
            let blockchain = this;
            if(!newChain)   return;

            // Copy newly published chain only if it is greater than own chain
            if(newChain.length > blockchain.chain.length){
                if(blockchain.copyChain(newChain))
                    console.log(`Copied chain with length ${newChain.length} from ${source}`);
                else
                    console.log(`Received an invalid chain with length ${newChain.length} from ${source}`);
            }else
                console.log(`Received a shorter chain with length ${newChain.length} from ${source}`);
            
        }catch(e){
            console.log(e);
            console.log('Something weird happened when received new blockchain !');
        }
    }
    mineBlock(minerWallet){
         const transactions = [];

        // Target transactions with highest fees
        const transactionList = mempool.getBestTransactions();
        
        // Add 1st transaction as a coinbase to reward opcoins to miner
        transactions.push(minerWallet.createCoinbase(this.chain.length, calculateTotalFees(transactionList)));
        transactions.push(...transactionList);

        try{
            let lastBlock = this.getLastBlock();

            let newBlock = undefined;
            // Check for Genesis block
            if(lastBlock == null)
                newBlock = pow(transactions, 0, this.chain.length);
            else
                newBlock = pow(transactions, lastBlock.hashSelf(), this.chain.length);
            this.chain.push(newBlock);
                
            // Storing chain into cache
            cache.setKey('blockchain', this.chain);

            // Remove mined transactions
            mempool.removeTransactions(this.getLastBlock());

            // Processing UTXO's of this new block
            utxo.processSingleBlock(newBlock);
            
            this.blockchainPubsub.publish({
                title: "New block", 
                description: this.chain
            })
            .catch(err => {
                console.log(err);
                console.log('Something wrong happened while publishing newly mined chain !');
                return -1;
            });
            return this.getLastBlock().height;
        }catch(e){
            console.log(e);
            console.log("Max transactions reached !!");
            return -2;
        }
    }
}
const blockchain = new Blockchain();



export default blockchain;