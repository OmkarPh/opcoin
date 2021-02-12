import express from 'express';
const router = new express.Router();

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


// Utility modules
import hasher from '../utils/hash.js';

// Constants
import { DIFFICULTY_ZEROES, MAX_TRANSACTIONS } from '../CONSTANTS/index.js';

// Major blockchain
import blockchain from '../blockchain.js';
import Transaction from '../classes/Transaction.js';

router.get('/validity', (req,res)=>{
    if(blockchain.isValid())
        res.status(200).json({message: "Valid blockchain"});
    else
        res.status(500).json({message: "Invalid blockchain !"});
});
router.get('/blockchain', async (req,res)=>{
    let chain = await blockchain.getChainWithHashes();
    res.status(200).json({
        length: chain.length,
        chain: chain
    });
});
router.get('/mempool', async (req,res)=>{
    let mempool = blockchain.getMempool();
    res.status(200).json({
        length: mempool.length,
        mempool: mempool
    }) 
});
router.post('/addTransaction', (req,res)=>{
    console.log(req.body);
    let newTransactionId = blockchain.addTransaction(req.body);
    for(let key of Transaction.requiredKeys)
        if(req.body[key] === undefined) 
            return res.status(400).json({
                            transactionId: -1,
                            message: "Insufficient properties posted !! \nRequired: sender, receiver, amount, fee"
                        });
    if(newTransactionId == -1)
        res.status(400).json({
            transactionId: -1,
            message: "Null values specified !! Please provide proper values."
        });
    else
        res.status(200).json({transactionId: newTransactionId, message: "Transaction successfully added to the mempool! You'll see it in a block soon :)"})
});
router.post('/mineBlock', (req,res)=>{
    console.log(`Started mining block #${blockchain.getLength()}`);
    let minedBlock = blockchain.mineBlock();
    if(minedBlock == 0)
        res.status(503).json({message: "No transactions in mempool, Cool down your mining rig (ー。ー) zzz"})
    else if(minedBlock == -1)
        res.status(500).json({message: `Some error occured while mining new block #${blockchain.getLength()}`});
    else
        res.status(200).json({message: `Mined block #${minedBlock} successfully`}); 
});
router.post('/addNode', (req,res)=>{
    if(!req.body.node && !req.body.node.address)  return res.status(400).json({messsage: "Insufficient properties posted !!"});
    blockchain.addNode(req.body.node.address);
    res.status(200).json({message: "Node added successfully !"});
});
router.get('/getnodes', (req, res)=>{
    res.status(200).json(blockchain.getNodes());
});
router.get('/syncChain', (req, res)=>{
    blockchain.syncChain().then(data =>{
        if(data === true)
            return res.status(202).json({
                message: `Block chain synced to latest state with ${blockchain.getLength()} blocks`
            })
        else
            return res.status(200).json({
                message: `Block chain is up-to-date with synced nodes !`
            })
    } ).catch(err =>{
        console.log("Error in Sync Chain router: ")
        console.log(err);
        return res.status(500).json({
            message: `Something went wrong during chain sync process :( Check logs for more details.`
        })
    });
})


export default router;