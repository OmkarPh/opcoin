import { verifySignature, calculateReward, hashSha256 } from '../utils/index.js';


function createOutput({senderWallet, receiver, amount, amountSelf=0}){
    const outputs = [
        {receiver, amount},
        {
           receiver: senderWallet.getPublicKey(),
           amount: amountSelf 
        }
    ];
    return outputs;
}

function createInput(senderWallet, inputUtxos, outputs){
    // Assumption: This somehow manages to get the UTXOs
    const inputs = [];
    for(const {utxo, hash} of inputUtxos){
        inputs.push({
            utxoID: hash,
            amount: utxo.amount,
            sender: utxo.receiver,
            signature: senderWallet.sign(JSON.stringify(outputs))
        });
    }
    return inputs;
}


export default class Transaction{
    constructor({senderWallet, receiver, amount, inputUtxos}){
        this.timestamp = Date.now().toString();

        let [fees, amountSelf] = this.calculateFeesAndReturns(inputUtxos, amount); 
        this.fee = fees

        this.outputs = createOutput({senderWallet, receiver, amount, amountSelf});
        this.inputs = createInput(senderWallet, inputUtxos, this.outputs);

        this.id = Transaction.hash({
            inputs: this.inputs,
            outputs: this.outputs,
            timestamp: this.timestamp,
            fee: fees
        });
    }


    calculateFeesAndReturns(inputUtxos, sendAmount){        
        let totalInput = 0;
        for(const {utxo:{amount}} of inputUtxos)
            totalInput += Number(amount)
        
        let fees=0;
        let returns = totalInput-sendAmount;

        // If sender can afford fees, then deduct otherwise don't
        if(returns > 0.0005){
            fees = 0.0005;
            returns -= 0.0005;
        }

        fees = Number(fees.toFixed(7));
        returns = Number(returns.toFixed(7));
        
        return [fees, returns];
    }

    static validate(transaction, utxo){

        if(!transaction)
            throw new Error('Transaction not provided into validate fn !');

        if(!utxo)
            throw new Error('Dependency utxo must be injected to perform validation.');

        const { inputs, outputs, fee } = transaction;

        let totalInput = 0;
        for(let {utxoID, amount, sender, signature} of inputs){
            if(!utxo.hasUtxo(utxoID))
                return false;
            if(!verifySignature({ publicKey: sender, data: outputs, signature }))
                return false;
            
            totalInput += amount;
        }

        let totalOutput = 0;
        outputs.forEach(({amount})=>totalOutput+=amount);
        totalOutput += fee;

        let largeOutput = (totalOutput - totalInput) > 0.000005 ;
        let largeDifference = (totalInput - totalOutput) > 0.00005;

        if(largeOutput || largeDifference){
            console.log('Invalid transaction denominations in following transaction:');
            console.log(transaction);
            console.log(`Verifying transaction...TotalInput: ${totalInput} TotalOutput: ${totalOutput}, Fee: ${fee}`);
            return false;
        }

        return true;
    }
    

    static sortDescending(t1, t2){
        return t2.fee - t1.fee
    }

    static hash({inputs, outputs, fee, timestamp}){
        return hashSha256(JSON.stringify({
            inputs, outputs, fee, timestamp
        }))
    }
    static hashUtxo({id, index}){
        return hashSha256(JSON.stringify({
            id,     // Universally unique identifier across multiple blocks and transactions
             index      // Identify specific utxo out of multiple utxos in same transaction having  same amount and address, since every utxo has different index(context of single transaction)
        }));
    }
    
    isValid(utxo){
        return Transaction.validate(this, utxo);
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

        this.id = Transaction.hash({input: this.inputs, output: this.outputs, timestamp: this.timestamp, fee:0});
    }

    static verify({inputs, outputs}, height, fees=0){
        const suitableReward = calculateReward(height, fees);
        
        if(inputs.length != 1 || outputs.length != 1){
            console.log('Input and output of coinbase transactions must have only 1 input and output respectively. Tx:');
            console.log(coinbaseTransaction);
            return false;
        }
        
        if(inputs[0].amount != suitableReward || outputs[0].amount != suitableReward){
            let diffInp = suitableReward - Number(inputs[0].amount);
            let diffOut = suitableReward - Number(outputs[0].amount);
            let differenceExceeded = diffInp < 0 || diffOut < 0 || diffInp > 0.00005 || diffOut > 0.00005;
            if(differenceExceeded){
                console.log(`Actual amounts: Input:${inputs[0].amount}, output:${outputs[0].amount}`);
                console.log(`Ideal amounts: Input:${suitableReward-fees}, output:${suitableReward}`);
                return false;
            }
        }

        return true;
    }
}

export {
    CoinbaseTransaction,
    Transaction
}