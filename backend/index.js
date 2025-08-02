const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const mainRouter = require('./routes/index');
const userRouter = require('./routes/user');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1',mainRouter);
// app.use('/api/v1/user',userRouter);


app.listen(process.env.PORT,()=>{
    console.log(`Listening on Port : ${process.env.PORT}`)
})