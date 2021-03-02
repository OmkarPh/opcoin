import { v4 as uuidv4 } from 'uuid';
import { verifySignature, calculateReward } from '../utils/index.js';


function createOutputMap({senderWallet, receiverPublicKey, amount}){
    const outputMap = {};
    outputMap[receiverPublicKey] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
}

function createInputMap(senderWallet, outputMap){
    return {
        timestamp: Date.now().toString(),
        amount: senderWallet.balance,
        publicKey: senderWallet.publicKey,
        signature: senderWallet.sign(JSON.stringify(outputMap))            
    }
}



export default class Transaction{
    constructor({senderWallet, receiverPublicKey, amount}){
        this.id = uuidv4();
        this.timestamp = Date.now().toString();
        this.outputMap = createOutputMap({senderWallet, receiverPublicKey, amount});
        this.inputMap = createInputMap(senderWallet, this.outputMap);
        this.fee = this.calculateFees();

        this.amount = 0.5;
        this.sender = this.receiver = 'dummy';
    }

    calculateFees(){
        const totalInput = this.inputMap.amount;
        // const totalInput = Object.values(this.inputMap)
            // .reduce((total, inputAmount) => total + inputAmount);
    
        const totalOutput = Object.values(this.outputMap)
            .reduce((total, outputAmount) => total + outputAmount);
        
        return totalInput - totalOutput;
    }

    static validate(transaction){
        const { inputMap: { publicKey, amount, signature }, outputMap, fee } = transaction;

        const totalInput = amount;
        // const totalInput = Object.values(inputMap)
        // .reduce((total, inputAmount) => total + inputAmount);

        const totalOutput =  Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);
                    
        // console.log(`Input: ${amount}, output: ${totalOutput}, fee: ${fee}`);
        if(amount !== totalOutput + fee){
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

class CoinbaseTransaction{
    constructor(height, minerPublicKey, fees){
        this.id = uuidv4();
        this.timestamp = Date.now().toString();
        
        let reward = calculateReward(height, fees);
        this.inputMap = {
            COINBASE: reward
        }
        this.outputMap = {
            [minerPublicKey] : reward
        }
    }
}

export {
    CoinbaseTransaction
}