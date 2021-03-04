import { verifySignature, calculateReward, hashSha256 } from '../utils/index.js';


function createOutput({senderWallet, receiver, amount, amountSelf=0}){
    // amountSelf = amountSelf !== undefined ? amountSelf : 0;
    const outputs = [];
    outputs.push({ receiver, amount })
    outputs.push({
        receiver: senderWallet.publicKey,
        amount: amountSelf
    })
    return outputs;
}

function createInput(senderWallet, output){
    // Assumption: This somehow manages to get the UTXOs
    const input = [];
    input.push({
        txId: 'hash',
        idx: 0,
        // height: 0,
        sender: senderWallet.publicKey,
        amount: 0,
        signature: senderWallet.sign(JSON.stringify(output))
    });
    return input;
}



export default class Transaction{
    constructor({senderWallet, receiver, amount}){
        this.timestamp = Date.now().toString();
        this.inputs = createInput(senderWallet);
        this.outputs = createOutput({senderWallet, receiver, amount, amountSelf:0});
        this.fee = this.calculateFees();

        this.amount = 0.5;
        this.sender = this.receiver = 'dummy';
        this.id = Transaction.hash({input: this.inputs, output: this.outputs, timestamp: this.timestamp});
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
    

    static sortDescending(t1, t2){
        return t2.fee - t1.fee
    }

    static hash({input, output, timestamp}){
        return hashSha256(JSON.stringify({
            input, output, timestamp
        }))
    }
    static hashUtxo({id, index}){
        return hashSha256(JSON.stringify({
            id,     // Universally unique identifier across multiple blocks and transactions
             index      // Identify specific utxo out of multiple utxos in same transaction having  same amount and address, since every utxo has different index(context of single transaction)
        }));
    }
    // TODO
    isValid(){
        return Transaction.validate(this);
    }
}

class CoinbaseTransaction{
    constructor(height, minerPublicKey, fees){
        
        this.timestamp = Date.now().toString();
        
        let reward = calculateReward(height, fees);
        this.inputs = [{
            sender: 'COINBASE',
            amount: reward
        }]
        this.outputs = [{
            receiver: minerPublicKey,
            amount: reward
        }]
        this.fee = 0;

        this.id = Transaction.hash({input: this.inputs, output: this.outputs, timestamp: this.timestamp});
    }

    // Add support for fees
    static verify({inputs, outputs, id}, height, fees=0){
        const suitableReward = calculateReward(height, fees);
        
        if(inputs.length != 1 || outputs.length != 1){
            console.log('Input and output of coinbase transactions must have only 1 input and output respectively. Tx:');
            console.log(coinbaseTransaction);
            return false;
        }

        if(inputs[0].amount != suitableReward-fees || outputs[0].amount != suitableReward){
            console.log(`Actual amounts: Input:${inputs[0].amount}, output:${outputs[0].amount}`);
            console.log(`Ideal amounts: Input:${suitableReward-fees}, output:${suitableReward}`);
            return false;
        }
        
        return true;
    }
}

export {
    CoinbaseTransaction,
    Transaction
}