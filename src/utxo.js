import { Transaction, CoinbaseTransaction } from './classes/Transaction.js';

class UTXO{
    constructor(){
        this.record = new Map();
        

    }
    processSingleBlock(newBlock, recordMap = this.record){
        const {height, transactions} = newBlock;
        
        // Special Coinbase transaction (0th)
        const coinbase = transactions[0];
        if(!CoinbaseTransaction.verify(coinbase, height)){
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

        // Go through all transactions of the block.
        for(let i=1; i<transactions.length; i++){

            const { id, inputs, outputs } = transactions[i];

            // Remove inputs from UTXO set
            inputs.forEach((input, index)=>{
                const { utxoID, amount,  sender } = input;


                // Checks if UTXO specified by this input actually exists
                let referencedUTXO = recordMap.get(utxoID);

                // If no record found, input is invalid, thus blockchain is invalid !
                if(!referencedUTXO){
                    console.log('No record found in tempRecord, thus declaring new block invalid !');
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

                recordMap.delete(referencedUtxohash);
            })

            // Add all outputs into UTXO set
            outputs.forEach((output, index)=>{
                const {receiver, amount} = output;

                // Set record for this output as UTXO
                recordMap.set(
                    Transaction.hashUTXO({ id, index}),
                    { receiver, amount }
                );
            });
            
        }
     
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

    addTx(transaction){

    }
    hasUtxo(hash){
        return this.record.has(hash);
    }
    getUtxo(hash){
        return this.record.get(hash)
    }

    getUtxoRecord(){
        return this.record;
    }

}
const utxo = new UTXO();



export default utxo;