import { DIFFICULTY_ZEROES } from '../CONSTANTS/index.js';

function proofOfWork(transactions, prevHash, createBlockFn, length){
    let newNonce = 0;
    let isValidProof = false;
    let currentBlock = null;
    
    while(!isValidProof){    
        // Create New blocks repeatedly
        currentBlock = createBlockFn(transactions, newNonce, prevHash, length);

        // If hash meets difficulty criteria, eligibl block is obtained, End the loop
        if(currentBlock.hashSelf().substr(0, 3) == DIFFICULTY_ZEROES)
            isValidProof = true
        else
            newNonce += 1;      // Keep incrementing nonce           
        
    }
    return currentBlock;
}


export default proofOfWork;