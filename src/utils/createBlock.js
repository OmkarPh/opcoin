// Constants
import { MAX_TRANSACTIONS } from '../CONSTANTS/index.js';

import Block from '../classes/Block.js';

function createBlock(transactions, proof, prevHash, height){
    if(transactions.length > MAX_TRANSACTIONS)
        throw new Error("Max transaction size reached");
    return new Block(height, Date.now().toString(), transactions, proof, prevHash);
}


export default createBlock;