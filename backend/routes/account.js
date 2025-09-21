const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authCheck = require('../middleware');
const { User, Account, Receipt } = require('../../db');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

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
    
    const { to:toAcc, amount } = req.body;
    if (!toAcc || !amount) return res.status(400).send('Missing fields');

    const fromAcc = await Account.findOne({ userId: req.userId }).session(session);

     if (!fromAcc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Sender not found' });
    }

    const availableBalance = fromAcc.balance;

    if (availableBalance < amount) {
        await session.abortTransaction();
        return res.json({ message: `Insufficient Balance : ${fromAcc}` }).status(400);
    }

    const transferToAcc = await Account.findOne({ userId: toAcc }).session(session);
    if (!transferToAcc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Receiver not found' });
    }

    await fromAcc.updateOne({ $inc: { balance: -amount } }).session(session);
    await transferToAcc.updateOne({ $inc: { balance: amount } }).session(session);

    const fromUser = await User.findById(fromAcc.userId);
    const toUser = await User.findById(toAcc);

       const txnId = uuidv4();
        const receipt = new Receipt({
            txnID:txnId,
            from:fromUser.firstName,
            to:toUser.firstName,
            amount:amount,
            date:new Date()
    });

    await receipt.save({session})
    await session.commitTransaction();
    return res.json({ message: "Transfer Successful" })
})
module.exports = router;

