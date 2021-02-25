import { DIFFICULTY_ZEROES } from '../CONSTANTS/index.js';

const isValid = (chain) => {

    // Chains with 0 or 1 block are by default valid 
    if(chain.length <= 1)  return true;

    let prevBlock = chain[0];
    let currBlock, currProof, prevProof, hash;

    for(let i = 1; i<chain.length; i++){
        currBlock = chain[i];

        // Validate fundamental rule of blockchain, Prev-Hash crypto links must sustain
        if(currBlock.prevHash != prevBlock.hashSelf()){
            console.log(`Something invalid with link between block no. ${prevBlock.number} and ${currBlock.number}`)
            console.log(currBlock.number, currBlock.prevHash, prevBlock.hashSelf());
            return false;
        }
        prevProof = prevBlock.proof;
        currProof = currBlock.proof;
        hash = currBlock.hashSelf();

        // Hashes must meet difficulty criteria
        // TODO: Change this to meet dynamic difficulty
        if(hash.substr(0,3) != DIFFICULTY_ZEROES)
            return false;
        
        prevBlock = currBlock;
    }
    return true;
}

export default isValid;