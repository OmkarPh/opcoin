import { ENTRIES_PER_PAGE } from '../CONSTANTS/index.js';

const getChainWithHashes = (page, chain) => { 
    let len = chain.length;
    if(len <= ENTRIES_PER_PAGE || !page)
        return  {
            page: 1,
            length: len,
            maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
            chain: chain.map(block => ({...block, hash: block.hashSelf()}))
        };

    let startIndex = len - ENTRIES_PER_PAGE * page;
    let endIndex = len - (ENTRIES_PER_PAGE * (page-1));
    
    // Out of bounds, in such case return as per ?page=1
    if(startIndex<0 && endIndex<=0){
        startIndex = len - ENTRIES_PER_PAGE * 1;
        endIndex = len;
        page = 1;
    }

    // If only startIndex is out of bound, then make it 0
    if(startIndex < 0)  startIndex = 0;
    return {
        page,
        length: len,
        maxPages: Math.ceil(len/ENTRIES_PER_PAGE),
        chain: chain.slice(startIndex, endIndex).reverse().map(block => ({...block, hash: block.hashSelf()}))
    };
}

export default getChainWithHashes;