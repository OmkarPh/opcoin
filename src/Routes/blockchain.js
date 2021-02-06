import express from 'express';
const router = new express.Router();
import hasher from '../utils/hash.js';

class Block{
    constructor(blockNumber, timestamp, transactions, proof, prevHash=0) {
        this.number = blockNumber;
        this.timestamp = timestamp;
        this.transactions = JSON.stringify(transactions);
        this.proof = proof;
        this.prevHash = prevHash;
    }
    hashSelf(){
        // console.log(JSON.stringify(this));
        return hasher(JSON.stringify(this));
    }
}

const blockchain = {
    chain: [],
    getLength: function(){ return this.chain.length },
    getChain: function(){ return  this.chain },
    getChainWithHashes: function(){ return  this.chain.map(block => ({...block, hash: block.hashSelf()})) },
    isValid: function(){
        if(this.chain.length <= 1)  return true;

        let prevBlock = this.chain[0];
        let currBlock, currProof, prevProof, hash;
        for(let i = 1; i<this.chain.length; i++){
            currBlock = this.chain[i];
            if(currBlock.prevHash != prevBlock.hashSelf()){
                console.log(`Something invalid with block no. ${prevBlock.number} and ${currBlock.number}`)
                console.log(currBlock.number, currBlock.prevHash, prevBlock.hashSelf());
                return false;
            }
            prevProof = prevBlock.proof;
            currProof = currBlock.proof;
            hash = hasher(String(currProof*currProof - prevProof*prevProof));
            if(hash.substr(0,3) != '000')
                return false;
            
            prevBlock = currBlock;
        }
        return true;
    },
    getLastBlock: function(){ 
        if(this.chain.length == 0)
            return null;
        return this.chain[this.chain.length -1] 
    },
    createBlock: function(transactions, proof, prevHash){
        const newBlock = new Block(this.chain.length+1, Date.now().toString(), transactions, proof, prevHash);
        this.chain.push(newBlock);
    },
    mineBlock: function(transactions = {}){
        try{
            let lastBlock = this.getLastBlock();
            if(lastBlock == null)
                blockchain.createBlock(
                    transactions, 
                    0, 
                    0
                );
            else
                blockchain.createBlock(
                    transactions, 
                    this.proofOfWork(lastBlock.proof), 
                    lastBlock.hashSelf()
                );
            return this.getLastBlock().number;
        }catch(e){
            console.log("Something went wrong at mineBlock function !!!!!");
            return -1;
        }
    },
    proofOfWork: (prevProof)=>{
        let newProof = 1;
        let isValidProof = false;
        let currentHash;
        while(!isValidProof){
            currentHash = hasher(String(newProof*newProof - prevProof*prevProof));
            // console.log("hash of", String(newProof*newProof + prevProof*prevProof), "is", currentHash)
            if(currentHash.substr(0, 3) == '000')
                isValidProof = true
            else{
                // newProof += 1;           // Simplest computation

                newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(999999999));        // Get newProof as its increment or some random value, this makes it jump way across and get very random proofs

                // newProof = Math.random() < 0.5 ? newProof+1 : Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));       // Get very random proofs in larger range
            }
        }
        // console.log("hash of", String(newProof*newProof + prevProof*prevProof), "is", currentHash)
        return newProof;
    }
}

console.log("Blockchain validity:", blockchain.isValid());

router.get('/validity', (req,res)=>{
    if(blockchain.isValid())
        res.status(200).json({message: "Valid blockchain"});
    else
        res.status(200).json({message: "valid"});
})
router.get('/blockchain', (req,res)=>{
    let chain = blockchain.getChainWithHashes();
    if(chain == null)   chain = [];
    res.status(200).json({
        length: chain.length,
        chain: blockchain.getChainWithHashes()
    });
});
router.post('/mineBlock', (req,res)=>{
    let minedBlock = blockchain.mineBlock({'t1':"gp to op"});
    if(minedBlock == -1)
        res.status(500).json({message: "Some error occured during mining process"});
    else
        res.status(200).json({message: `Mined block #${minedBlock} successfully`}); 
})


export default router;