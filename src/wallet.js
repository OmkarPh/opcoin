import path from 'path';
import { ec, verifySignature } from './utils/ec.js';
import hashSha256 from './utils/hash.js';
import Transaction, {CoinbaseTransaction} from './classes/Transaction.js';


// File-based caching
import Cache from './classes/Cache.js';
const cache = new Cache('wallet');


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
    calculateBalance(chain){
        let tempBalance = 0;
        let pubKey = this.getPublicKey();
        for(let {height, transactions} of chain){
            process.stdout.write(`Received OPs in block #${height}: `);
            for(let {id, inputMap, outputMap} of transactions){
                // Eliminating spent tx for this wallet's public key
                // Object.keys(inputMap)

                // Recording received tx for this wallet's public key
                Object.keys(outputMap).forEach(key => {
                    if(key == pubKey){
                        tempBalance += Number(outputMap[key])
                        process.stdout.write(outputMap[key]+", ");
                    }
                })
            }
            console.log();
            this.balance = tempBalance;
        }
        console.log(`Balance for ${pubKey}: ${this.balance} OPs`);
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
console.log(`Public key of this node's wallet: ${wallet.getPublicKey()}`)


export default wallet;