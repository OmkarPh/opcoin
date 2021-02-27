import { v4 as uuidv4 } from 'uuid';
import hasher from '../utils/hash.js';
import { verifySignature } from '../utils/ec.js';

export default class Transaction{
    constructor({senderWallet, receiverPublicKey, amount}){
        this.id = uuidv4();
        this.timestamp = Date.now().toString();
        this.outputMap = this.createOutputMap({senderWallet, receiverPublicKey, amount});
        this.input = this.createInput(senderWallet, this.outputMap);


        this.amount = 0;
        this.fee = 'dummy';
        this.sender = 'dummy';
        this.receiver = 'dummy';
    }
    createOutputMap({senderWallet, receiverPublicKey, amount}){
        const outputMap = {};
        outputMap[receiverPublicKey] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }
    createInput(senderWallet, outputMap){
        // console.log(senderWallet);
        return {
            timestamp: Date.now().toString(),
            amount: senderWallet.balance,
            publicKey: senderWallet.publicKey,
            signature: senderWallet.sign(JSON.stringify(outputMap))            
        }
    }

    static validate(transaction){
        const { input: { publicKey, amount, signature }, outputMap } = transaction;

        const totalOutput = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);
            
        if(amount !== totalOutput){
            console.log('Invalid transaction from pub key:', publicKey);
            return false;
        }

        if(!verifySignature({publicKey, data: outputMap, signature}))
            return false;
        return true;
    }

    static requiredKeys = ['sender', 'receiver', 'amount', 'fee']
    static sortDescending(t1, t2){
        return t2.fee - t1.fee
    }

    // TODO
    isValid(){
        return Transaction.validate(this);
    }
}