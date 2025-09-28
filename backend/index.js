const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

const mainRouter = require('./routes/index');
const userRouter = require('./routes/user');

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());

app.use('/api/v1',mainRouter);
// app.use('/api/v1/user',userRouter);

app.get('/',(req,res)=>{
    res.render('home');
})

app.listen(process.env.PORT,()=>{
    console.log(`Listening on Port : ${process.env.PORT}`)
})





