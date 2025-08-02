const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authCheck = require('../middleware');
const { User, Account } = require('../../db');
const mongoose = require('mongoose');


router.get('/balance', authCheck, async (req, res) => {
    try {
        const userAccount = await Account.findOne({ userId: req.userId });
        const userBalance = userAccount.balance
        return res.json({ balance: userBalance });
    }
    catch (e) {
        console.log(e);
        return res.json({ message: "Error" }).status(403);
    }
})

router.post('/transfer', authCheck, async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    
    const { to, amount } = req.body;
    const transferFromAcc = await Account.findOne({ userId: req.userId }).session(session);

    const availableBalance = transferFromAcc.balance;
    if (availableBalance < amount) {
        await session.abortTransaction();
        return res.json({ message: `Insufficient Balance : ${transferFromAcc}` }).status(400);
    }

    const transferToAcc = await Account.findOne({ userId: to }).session(session);

    await transferFromAcc.updateOne({ $inc: { balance: -amount } }).session(session);
    await transferToAcc.updateOne({ $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    return res.json({ message: "Transfer Successful" })
})
module.exports = router;





/*
Legacy Code For Transaction

    // try {
    //     await session.withTransaction(async () => {

    //         const transferFromAcc = await Account.findOne({ userId: req.userId });
    //         console.log(req.userId);
    //         console.log(transferFromAcc);
    //         const transferToAcc = await Account.findOne({ userId: to });
    //         console.log(transferToAcc);
    //         console.log(to);

    //         // 1. Check Available Balance.

    //         const availableBalance = transferFromAcc.balance;
    //         if (availableBalance < amount) {
    //             throw new Error(`Insufficient Balance : ${transferFromAcc}`);
    //         }

    //         //2. Update Balance for both account
    //         await transferFromAcc.updateOne(
    //             // { userId: transferFromAcc },
    //             { $inc: { balance: -amount } },
    //             { session }
    //         );

    //         await transferToAcc.updateOne(
    //             // { userId: transferToAcc },
    //             { $inc: { balance: amount } },
    //             { session }
    //         );

    //     })

    //     console.log('Amount Transferred successfully.');
    //     console.log(`Transfer Acc Balance : ${transferFromAcc.balance} \n Recieved Acc Balance : ${transferToAcc.balance}`)
    //     return res.json({message:"Transaction Succesful"}).status(200);

    // }
    // catch (e) {
    //     console.error('Error processing transaction:', e);
    //     return res.json({message:e}).status(400);
    // }
    // finally {
    //     session.endSession();
    // }
*/