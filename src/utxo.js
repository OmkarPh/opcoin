import { forEach } from 'lodash';
import { Transaction, CoinbaseTransaction } from './classes/Transaction.js';

class UTXO{
    constructor(){
        this.record = new Map();
        

    }
    replaceFromChain(newChain){
        let tempRecord = new Map();
        
        // Go through all blocks
        for(let block of newChain){
            const {height, transactions} = block;

            // Special Coinbase transaction (0th)
            const coinbase = transactions[0];
            if(!CoinbaseTransaction.verify(coinbase)){
                console.log('Something wrong with coinbase tx:');
                console.log(coinbase)
                return false
            }
            tempRecord.set(Transaction.hashUtxo({
                id: coinbase.id,
                index: 0
            }));

            // Go through all transactions of each block.
            for(let i=1; i<transactions.length; i++){

                const { id, inputs, outputs } = transactions[i];

                // Remove inputs from UTXO set
                inputs.forEach((input, index)=>{
                    const { txId, idx, amount,  sender } = input;

                    const referencedUtxohash = Transaction.hashUtxo({id: txId, index: idx});

                    // Checks if UTXO specified by this input actually exists
                    let referencedUTXO = tempRecord.get(referencedUtxohash);

                    // If no record found, input is invalid, thus blockchain is invalid !
                    if(!referencedUTXO){
                        console.log('No record found in tempRecord, thus declaring new chain invalid !');
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

                    tempRecord.delete(referencedUtxohash);
                })

                // Add all outputs into UTXO set
                outputs.forEach((output, index)=>{
                    const {receiver, amount} = output;

                    // Set record for this output as UTXO
                    tempRecord.set(
                        Transaction.hashUTXO({ id, index}),
                        { receiver, amount }
                    );
                });
                
            }
        }
        
        console.log('Updated Unspent transactions:');
        console.log(tempRecord);
        this.record = tempRecord;
        return true;
    }

    addTx(transaction){

    }

}
const utxo = new UTXO();



export default utxo;