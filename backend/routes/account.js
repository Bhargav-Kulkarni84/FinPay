const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authCheck = require('../middleware');
const { User, Account, Receipt } = require('../../db');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { uploadToS3, getPresignedUrl } = require('../services/AWS/s3'); // adjust path
const { publishMessage } = require('../services/AWS/sns');
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });


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

// Render transfer form
router.get('/transfer/:userId', authCheck, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    res.render('transfer', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// router.post('/transfer', authCheck, async (req, res) => {

//     const session = await mongoose.startSession();
//     session.startTransaction();
    
//     const { to:toAcc, amount } = req.body;
//     if (!toAcc || !amount) return res.status(400).send('Missing fields');

//     const fromAcc = await Account.findOne({ userId: req.userId }).session(session);

//      if (!fromAcc) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ error: 'Sender not found' });
//     }

//     const availableBalance = fromAcc.balance;

//     if (availableBalance < amount) {
//         await session.abortTransaction();
//         return res.json({ message: `Insufficient Balance : ${fromAcc}` }).status(400);
//     }

//     const transferToAcc = await Account.findOne({ userId: toAcc }).session(session);
//     if (!transferToAcc) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ error: 'Receiver not found' });
//     }

//     await fromAcc.updateOne({ $inc: { balance: -amount } }).session(session);
//     await transferToAcc.updateOne({ $inc: { balance: amount } }).session(session);

//     const fromUser = await User.findById(fromAcc.userId);
//     const toUser = await User.findById(toAcc);

//        const txnId = uuidv4();
//         const receipt = new Receipt({
//             txnID:txnId,
//             from:fromUser.firstName,
//             to:toUser.firstName,
//             amount:amount,
//             date:new Date()
//     });

//     await receipt.save({session})
//     await session.commitTransaction();
//     return res.json({ message: "Transfer Successful" })
// })

router.post('/transferMoney', authCheck, async (req, res) => {
  try {
    const { to: toAcc, amount } = req.body;
    if (!toAcc || !amount) throw new Error('Missing fields');

    const fromAcc = await Account.findOne({ userId: req.userId });
    const transferToAcc = await Account.findOne({ userId: toAcc });

    if (!fromAcc) throw new Error('Sender not found');
    if (!transferToAcc) throw new Error('Receiver not found');
    if (fromAcc.balance < amount) throw new Error('Insufficient balance');
    
    // Update balances
    const transferAmount = parseFloat(req.body.amount);
    if (isNaN(transferAmount) || transferAmount <= 0) throw new Error("Invalid amount");

    fromAcc.balance -= transferAmount;
    transferToAcc.balance += transferAmount;

    await fromAcc.save();
    await transferToAcc.save();

    // fromAcc.balance -= amount;
    // transferToAcc.balance += amount;

    // await fromAcc.save();
    // await transferToAcc.save();

    const txnId = uuidv4();
    const fromUser = await User.findById(fromAcc.userId);
    const toUser = await User.findById(toAcc);

    const receiptData = {
      txnID: txnId,
      from: `${fromUser.firstName} ${fromUser.lastName}`,
      to: `${toUser.firstName} ${toUser.lastName}`,
      amount: parseFloat(amount),
      date: new Date(),
    };

    // Upload receipt to S3
    const fileBuffer = Buffer.from(JSON.stringify(receiptData, null, 2));
    const fileName = `receipts/${txnId}.json`;
    await uploadToS3(fileName, fileBuffer, 'application/json');

    // Generate a pre-signed URL for download
    const receiptUrl = getPresignedUrl(fileName, 60 * 60); // valid for 1 hour

    // Save receipt in MongoDB
    const receipt = new Receipt({
      txnID: txnId,
      from: fromUser.firstName,
      to: toUser.firstName,
      amount: parseFloat(amount),
      date: new Date(),
      s3Url: receiptUrl,
    });
    await receipt.save();

    // Send email notification via SNS
    await publishMessage(process.env.AWS_SNS_TOPIC_ARN, receiptData, receiptUrl);

    //Lambda

    if (parseFloat(amount) > 1000) {
      try {
        await lambdaClient.send(new InvokeCommand({
          FunctionName: "Transaction_Logs", // updated Lambda function name
          Payload: Buffer.from(JSON.stringify({
            txnID: txnId,
            from: `${fromUser.firstName} ${fromUser.lastName}`,
            to: `${toUser.firstName} ${toUser.lastName}`,
            amount: parseFloat(amount),
            date: new Date(),
            receiptUrl
          }))
        }));
        console.log("Lambda invoked for high-value transaction.");
      } 
      catch (err) {
        console.error("Failed to invoke Lambda:", err);
      }
}

    // Send response / render receipt page
    res.render('transactionreceipt', {
      message: "Transfer Successful",
      receiptUrl: receiptUrl,
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;

// router.post('/transferMoney', authCheck, async (req, res) => {
//     try {
//         const { to: toAccId, amount } = req.body;

//         if (!toAccId || !amount) return res.status(400).json({ error: 'Missing fields' });

//         // Find sender and receiver accounts
//         const fromAcc = await Account.findOne({ userId: req.userId });
//         const toAcc = await Account.findOne({ userId: toAccId });

//         if (!fromAcc) return res.status(400).json({ error: 'Sender not found' });
//         if (!toAcc) return res.status(400).json({ error: 'Receiver not found' });

//         const transferAmount = parseFloat(amount);
//         if (fromAcc.balance < transferAmount) {
//             return res.status(400).json({ error: 'Insufficient balance' });
//         }

//         // Perform the transfer
//         await fromAcc.updateOne({ $inc: { balance: -transferAmount } });
//         await toAcc.updateOne({ $inc: { balance: transferAmount } });

//         // Save receipt
//         const fromUser = await User.findById(fromAcc.userId);
//         const toUser = await User.findById(toAccId);
//         const txnId = uuidv4();

//         const receipt = new Receipt({
//             txnID: txnId,
//             from: fromUser.firstName,
//             to: toUser.firstName,
//             amount: transferAmount,
//             date: new Date()
//         });

//         await receipt.save();

//         // return res.json({ message: 'Transfer Successful' });
//         return res.redirect('/api/v1/user/dashboard');

//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Server error' });
//     }

// });
