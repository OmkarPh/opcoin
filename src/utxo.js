import { Transaction, CoinbaseTransaction } from './classes/Transaction.js';

class UTXO{

    constructor(){
        this.record = new Map();
        this.postUpdateTasks = [];
    }

    processSingleBlock(newBlock, recordMap = this.record){
        const {height, transactions} = newBlock;
        
        let totalFees = 0;

        // Go through all transactions of the block.
        for(let i=1; i<transactions.length; i++){

            const { id, inputs, outputs, fee } = transactions[i];
            totalFees += fee;

            // Remove inputs from UTXO set
            for(let input of inputs){
                const { utxoID, amount,  sender } = input;

                // Checks if UTXO specified by this input actually exists
                let referencedUTXO = recordMap.get(utxoID);

                // If no record found, input is invalid, thus blockchain is invalid !
                if(!referencedUTXO){
                    console.log('No record found in tempRecord, thus declaring new block/chain invalid !');
                    return false;
                }

                if(referencedUTXO.receiver != sender || referencedUTXO.amount != amount){
                    console.log('Inconsistency between UTXO and input data, hence invalid chain !');
                    console.log('Input for tx:');
                    console.log(input);
                    console.log('Referenced UTXO: ');
                    console.log(referencedUTXO);
                    return false;
                }

                recordMap.delete(utxoID);
            }

            // Add all outputs into UTXO set
            outputs.forEach((output, index)=>{
                const {receiver, amount} = output;

                // Set record for this output as UTXO
                recordMap.set(
                    Transaction.hashUtxo({ id, index}),
                    { receiver, amount }
                );
            });
            
        }


        // Special Coinbase transaction (0th)
        const coinbase = transactions[0];
        if(!CoinbaseTransaction.verify(coinbase, height, totalFees)){
            console.log('Something wrong with coinbase tx:');
            console.log(coinbase)
            return false;
        }

        recordMap.set(Transaction.hashUtxo({
            id: coinbase.id,
            index: 0
        }), {
            receiver: coinbase.outputs[0].receiver,
            amount: coinbase.outputs[0].amount
        });
     
        this.postUpdateTasks.forEach(fn => fn(this.record));
        return true;
    }

    replaceFromChain(newChain){
        let tempRecord = new Map();
        
        // Go through all blocks
        for(let block of newChain){
            if(!this.processSingleBlock(block, tempRecord))
                return false;
        }

        this.record = tempRecord;
        return true;
    }

    getUtxoRecord(){
        return this.record;
    }
    
    hasUtxo(hash){
        let UTXO = this.record.get(hash);
        if(UTXO)
            if(UTXO.pending != undefined && UTXO.pending >= 0)
                return false;
        return true;
    }

    setPending(hash, postAmount = 0){
        if(this.record.has(hash)){
            this.record.get(hash).pending = postAmount;
            return true;
        }
        return false;
    }
    
    getUtxo(hash){
        return this.record.get(hash)
    }

}
const utxo = new UTXO();



export default utxo;