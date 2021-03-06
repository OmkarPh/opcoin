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

import { KEYWORDS } from './utils/pubsub.js';

class Wallet {
    constructor(){
        this.balance = 0;
        this.keyPair = ec.genKeyPair();        
        mempool.mempoolPubsub.addListener((transaction, {title})=>{
            console.log('Processing tx update. Is_deleteUpdate:', title==KEYWORDS.DELETE_TRANSACTIONS, title);
            if(title == KEYWORDS.DELETE_TRANSACTIONS)
                return mempool.removeOutdatedTx(transaction);
            if(Transaction.validate(transaction,utxo))
                mempool.addTransaction(transaction, 'network');
            else
                console.log(`Received invalid transaction from network #${transaction.id}`);
        })

        // Replacing pair, if key was cached earlier.
        let cachedPrivateKey = cache.getKey('private');
        if(!cachedPrivateKey)
            cache.setKey('private', this.keyPair.getPrivate());
        else
            this.keyPair = ec.keyFromPrivate(cachedPrivateKey, 'hex');

        this.selfUtxo = new Map();
        this.balance = this.calculateBalance();
        // utxo.postUpdateTasks.push(this.calculateBalance);
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
    createCoinbase(height, fees){
        return new CoinbaseTransaction(height, this.getPublicKey(), fees);
    }
    
    calculateBalance(){
        let tempBalance = 0;
        let pubKey = this.getPublicKey();

        this.selfUtxo.clear();

        let utxos = utxo.getUtxoRecord();

        utxos.forEach((utxo, hash)=>{
            const {receiver, amount} = utxo;
            if(receiver == pubKey){
                tempBalance += amount;
                this.selfUtxo.set(hash, utxo);
            }
        });

        this.balance = tempBalance;
        console.log(`Recalculated balance for ${minifyString(pubKey)}: ${this.balance} OPs`);
        return this.balance;
    }

    getBestInputs(amount){
        let inputUtxos = [];
        let inputTotal = 0;

        let lowUtxos = [];
        let lowTotal = 0;

        let highUtxos = [];

        for(let [hash, utxo] of this.selfUtxo.entries()){
            if(utxo.amount <= amount){
                lowTotal += utxo.amount;
                lowUtxos.push({utxo, hash});
                if(lowTotal >= amount)
                    break;
            }
            else
                highUtxos.push({utxo, hash});
        }


        if(lowTotal >= amount){
            lowUtxos.sort((a, b) => a.amount - b.amount);
            for(let utxo of lowUtxos){
                inputTotal += utxo.utxo.amount;
                inputUtxos.push(utxo);
                if(inputTotal >= amount)
                    break;
            }
        }else{
            let closest = highUtxos.reduce((a, b) => {
                if(a.utxo.amount <= b.utxo.amount)
                    return a;
                return b;
            });
            inputUtxos.push(closest);
        }
        
        // console.log(lowUtxos);
        // console.log(highUtxos);

        return inputUtxos;
    }



    createTransaction({receiverPublicKey, amount}){
        this.calculateBalance();
        if(amount > this.balance)
            throw new Error('Input amount exceeds, Transaction not possible');

        let inputs = this.getBestInputs(amount);
        // console.log('Best inputs:');
        // console.log(inputs);

        let tx = new Transaction({
            senderWallet: this, 
            receiver: receiverPublicKey, 
            amount,
            inputUtxos: inputs
        });
        mempool.addTransaction(tx, 'own wallet');
        return tx;
    }
}
const wallet = new Wallet()
console.log(`Public key of this node's wallet: ${minifyString(wallet.getPublicKey())}`)








export default wallet;