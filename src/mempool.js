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

    // TODO
    addTransaction(newTransaction){
        if(!newTransaction.isValid()) return -1;
        this.mempool.push(newTransaction);
        return newTransaction.id;
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