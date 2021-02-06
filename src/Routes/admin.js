import express from 'express';
const router = new express.Router();

router.get('/admin', (req,res)=>{
    res.send("Hello admin !!!")
})


export default router;