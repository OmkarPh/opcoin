import hasher from '../utils/hash.js';

export default class Block{
    constructor(blockNumber, timestamp, transactions, proof, prevHash=0) {
        this.number = blockNumber;
        this.timestamp = timestamp;

        this.transactions = transactions;
        this.proof = proof;
        
        this.prevHash = prevHash;
    }
    hashSelf(){
        // console.log(JSON.stringify(this));
        return hasher(JSON.stringify(this));
    }
}
