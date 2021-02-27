import express from 'express';
const router = new express.Router();

import mempool from '../mempool.js';
import wallet from '../wallet.js';

router.get('/mempool', async (req,res)=>{
    let page = req.query.page ? Math.round(parseInt(req.query.page)) : 1;
    if(!page)   page =1;
    
    let mempoolResponse = mempool.getMempool(page);
    res.status(200).json(mempoolResponse); 
});

export default router;