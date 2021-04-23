// PubSub networking utitlity
import PubSub from './utils/pubsub.js';
import {CHANNELS, KEYWORDS} from './utils/pubsub.js';

// Constants
import { MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

import Transaction from './classes/Transaction.js';

class Mempool {

    constructor(){
        this.mempool = [];
        this.mempoolPubsub = new PubSub([CHANNELS.OPCOIN_MEMPOOL]);
    }

    getLength(){
        return this.mempool.length;
    }

    getMempoolObj(){
        return this.mempool
    }

    getTransactionsFor(publickey){
        let filteredTx = [];
        txloop:
        for(let tx of this.mempool){
            let { inputs, outputs } = tx;
            for(let {receiver} of outputs)
                if(receiver == publickey){
                    filteredTx.push(tx);
                    continue txloop;
                }
            
            for(let {sender} of inputs)
                if(sender == publickey){
                    filteredTx.push(tx);
                    continue;
                }
        }
        return filteredTx;
    }

    getMempool(page){
        let len = this.mempool.length;
        
        if(len <= ENTRIES_PER_PAGE || !page)
            return  {
                page: 1,
                length: len,
                maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
                mempool: this.mempool.slice().reverse()
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

    addTransaction(transaction, source='network'){
        this.mempool.push(transaction);
        if(source != 'network')
            this.mempoolPubsub.publish({
                title: "New transaction",
                description: transaction
            })
        console.log(`Added transaction #${transaction.id} to mempool from ${source}`);
        return true;
    }

    removeOutdatedTx(outdatedIds){
        this.mempool = this.mempool.filter(tx => !outdatedIds.includes(tx.id));
    }

    removeTransactions(newBlock){
        this.mempool.splice(0, this.getBestTransactions().length);
    }

    getBestTransactions(){
        return this.mempool.sort(Transaction.sortDescending).slice(0, MAX_TRANSACTIONS-1);
    }
    
    syncMempool(){
        return false;
    }

}
const mempool = new Mempool();



export default mempool;