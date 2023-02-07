const dotenv= require("dotenv")
const express= require ("express")
const mongoose= require("mongoose")
const cors= require('cors')
const app=express();
const connectToDb = require("./db.js")
// const auth=require("./router/auth")
var http = require("http");

dotenv.config()

connectToDb();

app.use(cors())

app.use(express.json());



const PORT=process.env.PORT || 5000;

app.use(require('./router/auth'))
app.use(require('./router/forgot'))
app.use(require('./router/signin'))
app.use(require('./router/mail'))

// app.use("/auth",auth)

app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`)
})