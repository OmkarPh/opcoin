import path from 'path';

import { v4 as uuidv4 } from 'uuid';

// Utility modules
import pow from './utils/pow.js'
import isValidChain from './utils/isValid.js';
import hashedChain from './utils/hashedChain.js';


// File-based caching
import flatCache from 'flat-cache';
const cache = flatCache.load('blockchain', path.resolve('./.cache'));

// PubSub networking utitlity
import PubSub from './utils/pubsub.js';
import {CHANNELS, KEYWORDS} from './utils/pubsub.js';


// Constants
import { INIT_LISTEN, MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

// Classes
import Block from './classes/Block.js';
import Transaction from './classes/Transaction.js';

import mempool from './mempool.js';

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
                console.log('Unsubscribing and terminating initialization response acceptance');
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
    createBlock(transactions, proof, prevHash, length){
        if(transactions.length > MAX_TRANSACTIONS)
            throw new Error("Max transaction size reached");
        return new Block(length, Date.now().toString(), transactions, proof, prevHash);
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
        let mempoolArr = mempool.getMempoolObj();
        if(mempoolArr.length == 0)
            return 0;

        // Target transactions with highest fees
        let transactions = mempoolArr.sort(Transaction.sortDescending).slice(0, MAX_TRANSACTIONS);

        try{
            let lastBlock = this.getLastBlock();
            if(lastBlock == null)
                this.chain.push(pow(transactions, 0, this.createBlock, this.chain.length));
            else
                this.chain.push(pow(transactions, lastBlock.hashSelf(), this.createBlock, this.chain.length));
            
            // Storing chain into cache
            cache.setKey('blockchain', this.chain);
            cache.save();

            // Remove mined transactions
            mempool.removeTransactions(0, transactions.length);
            
            // Gift opcoins to miner
            // this.addTransaction({
            //     sender: this.nodeAddress,
            //     receiver: 'Omkar',
            //     amount: 0.5,
            //     fee: 0.00
            // });

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
}


const blockchain = new Blockchain();

export default blockchain;