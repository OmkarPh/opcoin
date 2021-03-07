import express from 'express';
const router = new express.Router();

import blockchain from '../blockchain.js';
import wallet from '../wallet.js';

router.get('/', (req,res)=>{
    res.json(wallet);
})


router.post('/newTransaction', (req,res)=>{
    const {receiverPublicKey, amount} = req.body;
    if(!receiverPublicKey || !amount)
        return res.status(400).json({message: 'Invalid request'});
    let newTx = wallet.createTransaction({receiverPublicKey,amount})
    
    if(!newTx)
        res.status(500).json({
            transactionId: -1,
            message: "Some error occured while adding the transaction :("
        });
    else
        res.status(200).json({txID: newTx.id, message: "Transaction successfully added to the mempool! You'll see it in a block soon :)"})
});

router.get('/balance', async (req, res)=>{
    let calculate = req.query.calculate ? true : false;
    let balance = 0;
    if(calculate)
        balance = wallet.calculateBalance();
    else
        balance = wallet.getBalance();
    let postTxBalance = wallet.getPostTxBalance();
    res.json({balance, postTxBalance, publicKey: wallet.getPublicKey()});
});

router.get('/publicKey', (req,res)=>{
    res.status(200).json({publicKey: wallet.getPublicKey()});
});

export default router;