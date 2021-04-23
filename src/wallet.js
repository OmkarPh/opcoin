import { stringify as flattedStringify } from 'flatted';

import { ec } from './utils/ec.js';
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
import { BALANCE_TIMEOUT, DEFAULT_KEY } from './CONSTANTS/index.js';

class Wallet {
    constructor(){
        this.balance = 0;
        this.postTxBalance = 0;

        this.keyPair = ec.genKeyPair();

        this.lastCalculated = Date.now() - BALANCE_TIMEOUT - 2000;


        // Replacing pair, if key was cached earlier.
        let cachedPrivateKey = cache.getKey('private');
        if(cachedPrivateKey)
            this.keyPair = ec.keyFromPrivate(cachedPrivateKey, 'hex');
        else if(DEFAULT_KEY){
            this.keyPair = ec.keyFromPrivate(DEFAULT_KEY, 'hex');
            cache.setKey('private', this.keyPair.getPrivate());
        } else
            cache.setKey('private', this.keyPair.getPrivate());

        this.selfUtxo = new Map();
        this.selfPendingUtxo = new Map();

        this.balance = this.calculateBalance(true);

        mempool.mempoolPubsub.addListener((transaction, {title})=>{
            if(title == KEYWORDS.DELETE_TRANSACTIONS){
                return mempool.removeOutdatedTx(transaction.map(tx => tx.id));
            }
            if(Transaction.validate(transaction,utxo))
                mempool.addTransaction(transaction, 'network');
            else
                console.log(`Received invalid transaction from network #${transaction.id}`);
        });
        blockchain.postUpdateTasks.push(()=>{
            let outdatedTxIDs = [];
            mempool.mempool.forEach(tx => {
                if(!Transaction.validate(tx, utxo))
                    outdatedTxIDs.push(tx.id);
            });
            mempool.removeOutdatedTx(outdatedTxIDs);
        });
    }

    sign(data){
        return this.keyPair.sign(hashSha256(data));
    }

    getPostTxBalance(){
        return this.postTxBalance;
    }

    getSelfUtxo(){
        return this.selfUtxo;
    }

    getBalance(){
        return this.balance;
    }

    getPrivateKey(){
        let pk = flattedStringify(this.keyPair.getPrivate());
        return pk.substring(2, pk.length-2);
    }

    getPublicKey(){
        return this.keyPair.getPublic().encode('hex');
    }

    setPrivateKey(newPrivateKey){
        if(typeof newPrivateKey != 'string')
            throw new Error('Expected new private key to be a string');
            
        newPrivateKey = newPrivateKey.toLowerCase();
        if(!/^[a-f0-9]{64}$/.test(newPrivateKey))
            throw new Error('Invalid private key !!');

        this.keyPair = ec.keyFromPrivate(newPrivateKey, 'hex');
        cache.setKey('private', this.keyPair.getPrivate());
        
        console.log();
        console.log(`Changed privated key !!   New pair:`);
        console.log(this.getPrivateKey());
        console.log(this.getPublicKey());
        console.log();

        this.calculateBalance(true);
    }

    createCoinbase(height, fees){
        return new CoinbaseTransaction(height, this.getPublicKey(), fees);
    }

    calculateBalance(forced=false){
        if(!forced && Date.now() - this.lastCalculated < BALANCE_TIMEOUT)
            return this.balance;

        let tempBalance = 0;
        let tempPostTxBalance = 0;

        let pubKey = this.getPublicKey();

        this.selfUtxo.clear();

        let utxos = utxo.getUtxoRecord();

        utxos.forEach((utxo, hash)=>{
            const {receiver, amount, pending} = utxo;
            if(receiver == pubKey){
                if(pending != undefined && pending >= 0){
                    this.selfPendingUtxo.set(hash, utxo);
                    tempPostTxBalance += pending;
                }else{
                    tempPostTxBalance += amount;
                    this.selfUtxo.set(hash, utxo);
                }
                tempBalance += amount;
            }
        });

        this.balance = tempBalance;
        this.postTxBalance = tempPostTxBalance;
        console.log(`Recalculated balance for ${minifyString(pubKey)}: ${this.balance} OPs`);
        this.lastCalculated = Date.now();        return this.balance;
    }

    getBestInputs(amount){
        let inputUtxos = [];
        let inputTotal = 0;

        let lowUtxos = [];
        let lowTotal = 0;

        let highUtxos = [];

        for(let [hash, utxo] of this.selfUtxo.entries()){
            if(utxo.amount <= amount){
                lowTotal += Number(utxo.amount);
                lowUtxos.push({utxo, hash});
                if(lowTotal >= Number(amount))
                    break;
            }
            else
                highUtxos.push({utxo, hash});
        }
        if(lowTotal >= amount){
            lowUtxos.sort((a, b) => a.utxo.amount - b.utxo.amount);
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
        

        return inputUtxos;
    }

    createTransaction({receiverPublicKey, amount}){
        this.calculateBalance(true);
        let selfPublic = this.getPublicKey();

        if(amount > this.balance)
            throw new Error(`Input amount exceeds your balance ( ${this.balance} OP coins ), Transaction not possible !!`);

        let inputs = this.getBestInputs(amount);
        
        let tx = new Transaction({
            senderWallet: this, 
            receiver: receiverPublicKey, 
            amount,
            inputUtxos: inputs
        });
        let returnAmount = 0;
        tx.outputs.forEach(({receiver, amount}) => {
            if(receiver == selfPublic)
                returnAmount += amount
        });

        inputs.forEach(({hash}) => utxo.setPending(hash, 0))
        utxo.setPending(inputs[0].hash, returnAmount);

        mempool.addTransaction(tx, 'own wallet');
        this.calculateBalance(true);
        return tx;
    }
}
const wallet = new Wallet()
console.log(`Public key of this node's wallet: ${minifyString(wallet.getPublicKey())}`)


export default wallet;