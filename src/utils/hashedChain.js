import { ENTRIES_PER_PAGE } from '../CONSTANTS/index.js';

const getChainWithHashes = (page, chain) => { 
    
    const len = chain.length;

    // If final length of response is greater than actual length, return chain without slicing
    if(len <= ENTRIES_PER_PAGE || !page)
        return  {
            page: 1,
            length: len,
            maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
            chain: chain.slice().reverse().map(block => ({...block, hash: block.hashSelf()}))
        };

    // Compute start and end indices based on page number 
    let startIndex = len - ENTRIES_PER_PAGE * page;
    let endIndex = len - (ENTRIES_PER_PAGE * (page-1));
    
    // Both indices out of bounds, in such case return as ?page=1
    if(startIndex<0 && endIndex<=0){
        startIndex = len - ENTRIES_PER_PAGE * 1;
        endIndex = len;
        page = 1;
    }

    // If only startIndex is out of bound, then make it 0 
    if(startIndex < 0)  
        startIndex = 0;

    return {
        page,
        length: len,
        maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
        chain: chain.slice(startIndex, endIndex).reverse().map(block => ({...block, hash: block.hashSelf()}))
    };
}

export default getChainWithHashes;