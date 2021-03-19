import express from 'express';
const router = new express.Router();

import wallet from '../wallet.js';

router.get('/', (req,res)=>{
    wallet.calculateBalance();
    const { balance, postTxBalance } = wallet;
    res.status(200).json({
        balance,
        postTxBalance,
        publicKey: wallet.getPublicKey(),
        privateKey: wallet.getPrivateKey()
    });
})

router.post('/changeKey', (req,res)=>{
    let {pk} = req.body;
    if(!pk)
        return res.status(400).json({
            message: 'Invalid request !!'
        });

    try{
        wallet.setPrivateKey(pk);
        return res.status(200).json({
            message: 'Private key changed successfuly'
        })
    }catch(err){
        res.status(400).json({
            message: 'Desired private key is invalid :('
        })
    }
})

router.post('/newTransaction', (req,res)=>{
    let {receiverPublicKey, amount} = req.body;
    amount = Number(amount);
    
    if(!receiverPublicKey || !amount)
        return res.status(400).json({message: 'Invalid request'});

    let newTx = undefined;
    try{
        newTx = wallet.createTransaction({receiverPublicKey,amount})
    }catch(err){
        return res.status(406).json({
            transactionId: -1,
            message: err.message
        })
    }
    
    if(!newTx)
        return res.status(500).json({
            transactionId: -1,
            message: "Some error occured while adding the transaction :("
        });
    
    res.status(200).json({txID: newTx.id, message: "Transaction successfully added to the mempool! You'll see it in a block soon :)"})
});

router.get('/utxo', (req, res)=>{
    res.status(200).json(Array.from(wallet.getSelfUtxo().entries()));
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