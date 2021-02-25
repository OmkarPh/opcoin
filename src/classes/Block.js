import hasher from '../utils/hash.js';

export default class Block{
    constructor(blockNumber, timestamp, transactions, nonce, prevHash=0) {
        this.number = blockNumber;
        this.timestamp = timestamp;

        this.transactions = transactions;
        this.nonce = nonce;
        
        this.prevHash = prevHash;
    }
    hashSelf(){
        // Globally used hash function for verification
        return hasher(JSON.stringify(this));
    }
}