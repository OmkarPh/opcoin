import express from 'express';
const router = new express.Router();

// Major blockchain
import blockchain from '../blockchain.js';
import wallet from '../wallet.js'; 
import utxo from '../utxo.js';

router.get('/block/:blockNo', (req,res)=>{
    let block = blockchain.getBlock(req.params.blockNo);
    if(block)
        return res.status(200).json({...block, hash: block.hashSelf()});
    res.status(400).json({message: "Invalid block no. requested !"});
})

router.get('/blockchain', async (req,res)=>{
    let page = req.query.page ? Math.round(parseInt(req.query.page)) : 1;
    if(!page)   page = 1;

    let chain = await blockchain.getChainWithHashes(page);
    res.status(200).json(chain);
});

router.post('/mineBlock', (req,res)=>{
    process.stdout.write(`Attempting to mine block #${blockchain.getLength()} ........ `);
    let minedBlock = blockchain.mineBlock(wallet);
    if(minedBlock == -2)
        res.status(503).json({message: "No transactions in mempool, Cool down your mining rig (ー。ー) zzz"})
    else if(minedBlock == -1)
        res.status(500).json({message: `Some error occured while mining new block #${blockchain.getLength()-1}`});
    else{
        console.log(`Mined block #${minedBlock} successfully !`);
        res.status(200).json({message: `Mined block #${minedBlock} successfully`}); 
    }
});

router.get('/tx/:publicKey', (req, res)=>{
    let publicKey = req.params.publicKey;
    if(publicKey == 'myTx')
        publicKey = wallet.getPublicKey();
    res.status(200).json(blockchain.getTransactionsFor(publicKey));
});

router.get('/validity', (req,res)=>{
    if(blockchain.isValid())
        res.status(200).json({message: "Valid blockchain"});
    else
        res.status(500).json({message: "Invalid blockchain !"});
});

router.get('/utxo', (req,res)=>{
    return res.status(200).json([...utxo.getUtxoRecord()]);
})

export default router;