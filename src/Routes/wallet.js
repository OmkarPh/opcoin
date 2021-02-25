import express from 'express';
const router = new express.Router();

import wallet from '../wallet.js';
console.log('Public key in wallet.js', wallet.publicKey);

router.get('/wallet', (req,res)=>{
    res.json(wallet);
})


export default router;