const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();
// console.log(process.env);
const mongoURL = process.env.mongoURL ;
console.log( process.env.mongoURL );


mongoose.connect(mongoURL).
then(()=>{
    console.log("Mongo Connection Successful");
})
.catch((e)=>{
    console.log("Error Connecting to MongoDB",e);
})

const Schema = mongoose.Schema;

const userSchema = new Schema({

    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },

    password_hash:{
        type:String,
        required:true,
        minLength:6,
    },

    firstName:{
        type:String,
        required:true,
        trim:true,
    },

    lastName:{
        type:String,
        required:true,
        trim:true
    },
    
    // accounts:[{type: Schema.Types.ObjectId, ref:"Account"}]

})

userSchema.methods.createHash = async function(plainTextPassword){

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword,saltRounds);
    return hashedPassword;

}

userSchema.methods.validatePassword = async function (candidatePassword){
    const match = await bcrypt.compare(candidatePassword,this.password_hash);
    return match;
}

const accountSchma = new Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectID, 
        required:true,
        ref:'User'
    },
    balance:{
        type:Number, 
        min:0, 
        required:true
    }
});

const receiptSchema = new Schema({
  
    txnID: {type: String, required:true},
    from: {type: String,required:true},
    to : {type: String,required:true},
    amount:{type:Number,required:true},
    date:{type:Date,required:true}

})

const User = mongoose.model('User',userSchema);
const Account = mongoose.model('Account',accountSchma);
const Receipt = mongoose.model('Receipt',receiptSchema);

module.exports = {User,Account,Receipt};