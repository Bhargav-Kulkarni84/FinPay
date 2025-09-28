const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const z = require('zod');
const {User,Account} = require('../../db');
const authCheck = require('../middleware');

dotenv.config();

router.get('/signup',async(req,res)=>{
    res.render('signup');
})

router.post('/signup', async (req, res) => {

    const { userName, firstName, lastName, password } = req.body;

    console.log("Inside Post Method Singup");

    //Do input validation 

    const validateUser = z.object({
        userName: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        password: z.string()
    })

    const result = validateUser.safeParse({ userName, firstName, lastName, password });

    //Check if entered data follows the desired validation rules.
    if (result.success) {

        //Check for the existing user :
        const exists = await User.findOne({
            userName: userName
        });

        if (exists) {
            // console.log(exists);
            return res.json({ message: "Email already taken" }).status(411);
        }

        //Save the new User to DataBase;
        // Try Saving User
        try {

            const newUser = new User({
                userName: userName,
                firstName: firstName,
                lastName: lastName,
            });

            const hashedPassword = await newUser.createHash(password);
            newUser.password_hash = hashedPassword;

            await newUser.save();
            const userId = newUser._id;

            console.log(userId);

            const newAccount = new Account({
                userId: userId,
                balance: (Math.random()*10000)
            })
            
            await newAccount.save();

            // Generate a token
            // const token = jwt.sign({ userId }, process.env.JWT_SECRET)
            //Return the signed token
            // return res.json({ message: "User created successfully", token: token }).status(200);
        
        const token = jwt.sign({ userId }, process.env.JWT_SECRET)    
        res.cookie('authToken', token, { httpOnly: true, secure: true });
        res.redirect('/api/v1/user/dashboard');


        }
        // If Any Error Occure send the response back.
        catch (e) {
            console.log(e);
            return res.json({ message: "Email already taken / Incorrect inputs" }).status(411);
        }

    }

    else {
        // console.log(result.success);
        // return res.json({ message: "Email already taken / Incorrect inputs" }).status(411);
        return res.json({ message: "Incorrect inputs" }).status(411);
    }

})

router.get('/signin',async(req,res)=>{
    res.render('signin');
})

router.post('/signin', async (req, res) => {

    const { userName, password } = req.body;

    //Validate Entered Login Credentials:

    const validateUser = z.object({
        userName: z.string().email(),
        password: z.string()
    })

    const result = validateUser.safeParse({ userName, password });

    if (result) {

        //Find user by userName(unique email)
        const existingUser = await User.findOne({ userName: userName });

        if (existingUser == null) {
            return res.json({ message: "Error while logging in" });
        }
        else {

            const passwordCheck = await existingUser.validatePassword(password);
            if (passwordCheck) {
                // const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);
                // return res.json({ token: token });

                const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {expiresIn: '1d'});
                res.cookie('authToken', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // only HTTPS in production
                    maxAge: 24*60*60*1000 // 1 day
                });

                res.redirect('/api/v1/user/dashboard');

            }
            else {
                return res.json({ message: "Error while logging in" });
            }
        }

    }

    else {
        return res.json({ message: "Error while logging in" });
    }

})

router.post('/logout',async(req,res)=>{
    res.clearCookie('authToken');
    res.redirect('/api/v1/user/signin');
})

router.get('/dashboard',authCheck,async(req,res)=>{
    // const users = await User.find();
    const users = await User.find({ _id: { $ne: req.userId } });
    const currentAccount = await Account.findOne({ userId: req.userId });
    const currentUserBalance = currentAccount ? currentAccount.balance : 0;
    res.render('dashboard', { users, currentUserBalance });
})

router.put('/', authCheck, async (req, res) => {

    const { password, firstName, lastName } = req.body;

    const validateUser = z.object({
        firstName: z.string(),
        lastName: z.string(),
        password: z.string()
    })

    const result = validateUser.safeParse({ password, firstName, lastName });

    if (result) {

        try {

            const updateUser = await User.findByIdAndUpdate(req.userId, {
                firstName: firstName,
                lastName: lastName
            })

            updateUser.password_hash = await updateUser.createHash(password);

            await updateUser.save();

            return res.json({ message: "Updated Succesfully" }).status(200);
        }
        catch (e) {
            console.log(e);
            return res.json({ message: "Error while updating information" }).status(411);

        }

    }
    else {
        return res.json({ message: "Error while updating information" }).status(411);
    }


})

router.get('/bulk', async (req, res) => {

    // const {firstName,lastName} = 

    const name = req.query.filter;

    const Users = await User.find({ $or: [{ firstName: name }, { lastName: name }] });

    const returnVal = [];

    Users.forEach((user) => {
        returnVal.push(
            {
                firstName: user.firstName,
                lasttName: user.lastName,
                _id: user._id
            }
        )
    })

    return res.json({ returnVal });
})

module.exports = router;
