import path from 'path';
import { ec, verifySignature } from './utils/ec.js';
import hashSha256 from './utils/hash.js';
import Transaction, {CoinbaseTransaction} from './classes/Transaction.js';


// File-based caching
import Cache from './classes/Cache.js';
const cache = new Cache('wallet');

import { minifyString } from './utils/index.js'; 

import blockchain from './blockchain.js';
import mempool from './mempool.js';
import utxo from './utxo.js';

class Wallet {
    constructor(){
        this.balance = 0;
        this.keyPair = ec.genKeyPair();        

        // Replacing pair, if key was cached earlier.
        let cachedPrivateKey = cache.getKey('private');
        if(!cachedPrivateKey)
            cache.setKey('private', this.keyPair.getPrivate());
        else
            this.keyPair = ec.keyFromPrivate(cachedPrivateKey, 'hex');

        this.balance = this.calculateBalance();
        this.utxo = new Map();
    }
    sign(data){
        return this.keyPair.sign(hashSha256(data));
    }
    getBalance(){
        return this.balance;
    }
    getPrivateKey(){
        console.log(this.keyPair.getPrivate())
        return String(this.keyPair.getPrivate());
    }
    getPublicKey(){
        return this.keyPair.getPublic().encode('hex');
    }

    // Pending
    calculateBalance(){
        let tempBalance = 0;
        let pubKey = this.getPublicKey();

        let utxos = utxo.getUtxo();

        utxos.forEach(({receiver, amount}, hash)=>{
            if(receiver == pubKey)
                tempBalance += amount;
        });
        this.balance = tempBalance;
        console.log(`Recalculated balance for ${minifyString(pubKey)} is ${this.balance} OPs`);
        return this.balance;
    }
    createTransaction({receiverPublicKey, amount}){
        if(amount > this.balance)
            throw new Error('Input amount exceeds, Transaction not possible');
        let tr = new Transaction({senderWallet: this, receiverPublicKey, amount});
       
        return tr;
    }
    createCoinbase(height, fees){
        return new CoinbaseTransaction(height, this.getPublicKey(), fees);
    }
}
const wallet = new Wallet()
console.log(`Public key of this node's wallet: ${minifyString(wallet.getPublicKey())}`)



// Old dummy initializer
// // Blockchain initializer
// const initTransactions = [
//     ["gp", "op", 3, 0.0005],
//     ["pp", "gp", 9, 0.00002],
//     // ["pp", "op", 3, 0.0002],
//     // ["op", "gp", 6, 0.0015], 
//     // ["op", "gp", 25, 0.525], 
//     // ["op", "pp", 4, 0.845],
//     // ["pp", "op", 6, 0.062],
//     // ["pp", "op", 3, 1.052],
// ];

// if(process.env.NODE_ENV !== 'production' && process.argv[3] === 'dummy')
//     for(let [sender, receiver, amount] of initTransactions)
//         mempool.addTransaction(
//             wallet.createTransaction({receiverPublicKey: receiver, amount})
//         );

// for(let [sender, receiver, amount] of initTransactions)
//     mempool.addTransaction(
//         wallet.createTransaction({receiverPublicKey: receiver, amount})
//     );

// if(process.env.NODE_ENV !== 'production' && process.argv[3] === 'dummy')
//     for(let i=0; i<2; i++)    blockchain.mineBlock();








export default wallet;