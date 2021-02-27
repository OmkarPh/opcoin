// PubSub networking utitlity
import PubSub from './utils/pubsub.js';
import {CHANNELS, KEYWORDS} from './utils/pubsub.js';

// Constants
import { INIT_LISTEN, MAX_TRANSACTIONS, ENTRIES_PER_PAGE } from './CONSTANTS/index.js';

import Transaction from './classes/Transaction.js';
import blockchain from './blockchain.js';
import wallet from './wallet.js';

class Mempool {
    constructor(){
        this.mempool = [];
        this.mempoolPubsub = new PubSub([CHANNELS.OPCOIN_MEMPOOL]);

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

    // TODO
    addTransaction(newTransaction){
        if(!newTransaction.isValid()) return -1;
        this.mempool.push(newTransaction);
        return newTransaction.id;
    }
    removeTransactions(endIdx){
        this.mempool.splice(0, endIdx);
    }
    syncMempool(){
        return false;
    }

}
const mempool = new Mempool();



// Blockchain initializer
const initTransactions = [
    ["gp", "op", 3, 0.0005],
    ["pp", "op", 9, 0.00002],
    // ["pp", "op", 3, 0.0002],
    // ["op", "gp", 6, 0.0015], 
    // ["op", "gp", 25, 0.525], 
    // ["op", "pp", 4, 0.845],
    // ["pp", "op", 6, 0.062],
    // ["pp", "op", 3, 1.052],
];

for(let [sender, receiver, amount] of initTransactions)
    mempool.addTransaction(
        wallet.createTransaction({receiverPublicKey: receiver, amount})
    );
// for(let [sender, receiver, amount] of initTransactions)
//     mempool.addTransaction(
//         wallet.createTransaction({receiverPublicKey: receiver, amount})
//     );

// if(process.env.NODE_ENV !== 'production' && process.argv[3] === 'dummy')
//     for(let i=0; i<2; i++)    blockchain.mineBlock();



export default mempool;