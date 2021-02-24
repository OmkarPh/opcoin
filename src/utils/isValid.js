import { DIFFICULTY_ZEROES } from '../CONSTANTS/index.js';

const isValid = (chain) => {
    if(chain.length <= 1)  return true;

    let prevBlock = chain[0];
    let currBlock, currProof, prevProof, hash;

    for(let i = 1; i<chain.length; i++){
        currBlock = chain[i];
        if(currBlock.prevHash != prevBlock.hashSelf()){
            console.log(`Something invalid with link between block no. ${prevBlock.number} and ${currBlock.number}`)
            console.log(currBlock.number, currBlock.prevHash, prevBlock.hashSelf());
            return false;
        }
        prevProof = prevBlock.proof;
        currProof = currBlock.proof;
        hash = currBlock.hashSelf();
        if(hash.substr(0,3) != DIFFICULTY_ZEROES)
            return false;
        
        prevBlock = currBlock;
    }
    return true;
}

export default isValid;