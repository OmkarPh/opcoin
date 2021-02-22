import { DIFFICULTY_ZEROES } from '../CONSTANTS/index.js';

function proofOfWork(transactions, prevHash, createBlockFn, length){
    let newNonce = 0;
    let isValidProof = false;
    let currentBlock = null;
    while(!isValidProof){
        currentBlock = createBlockFn(transactions, newNonce, prevHash, length);
        if(currentBlock.hashSelf().substr(0, 3) == DIFFICULTY_ZEROES)
            isValidProof = true
        else{
            // Simplest computation
            newNonce += 1;           

            // Get newProof as its increment or some random value, this makes it jump way across and get very random proofs
            // newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(999999999));        

            // Get very random proofs in larger range
            // newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));       
        }
    }
    return currentBlock;
}


export default proofOfWork;