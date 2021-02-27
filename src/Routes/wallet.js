import express from 'express';
const router = new express.Router();

import blockchain from '../blockchain.js';

import wallet from '../wallet.js';

router.get('/wallet', (req,res)=>{
    res.json(wallet);
})


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


export default router;