import express from 'express';
const router = new express.Router();

import mempool from '../mempool.js';
import wallet from '../wallet.js';

router.get('/', async (req,res)=>{
    let page = req.query.page ? Math.round(parseInt(req.query.page)) : 1;
    if(!page)   page =1;
    
    let mempoolResponse = mempool.getMempool(page);
    res.status(200).json(mempoolResponse); 
});

router.get('/tx/:publicKey', (req, res)=>{
    let publicKey = req.params.publicKey;
    if(publicKey == 'myTx')
        publicKey = wallet.getPublicKey();
    res.status(200).json(mempool.getTransactionsFor(publicKey));
});


export default router;