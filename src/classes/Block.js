import hasher from '../utils/hash.js';

export default class Block{
    constructor(height, timestamp, transactions, nonce, prevHash=0) {
        this.height = height;
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