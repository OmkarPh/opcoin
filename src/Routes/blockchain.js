import express from 'express';
const router = new express.Router();

// Major blockchain
import blockchain from '../blockchain.js';
import Transaction from '../classes/Transaction.js';

router.get('/blockchain', async (req,res)=>{
    let page = req.query.page ? Math.round(parseInt(req.query.page)) : 1;
    if(!page)   page = 1;

    let chain = await blockchain.getChainWithHashes(page);
    res.status(200).json(chain);
});

router.post('/mineBlock', (req,res)=>{
    process.stdout.write(`Attempting to mine block #${blockchain.getLength()} ........ `);
    let minedBlock = blockchain.mineBlock();
    if(minedBlock == -2)
        res.status(503).json({message: "No transactions in mempool, Cool down your mining rig (ー。ー) zzz"})
    else if(minedBlock == -1)
        res.status(500).json({message: `Some error occured while mining new block #${blockchain.getLength()-1}`});
    else{
        console.log(`Mined block #${minedBlock} successfully !`);
        res.status(200).json({message: `Mined block #${minedBlock} successfully`}); 
    }
});

router.get('/validity', (req,res)=>{
    if(blockchain.isValid())
        res.status(200).json({message: "Valid blockchain"});
    else
        res.status(500).json({message: "Invalid blockchain !"});
});


export default router;