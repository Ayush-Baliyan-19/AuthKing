const mongoose= require("mongoose");
const dotenv = require("dotenv")

dotenv.config();

const connectToDb=()=>{
    mongoose.connect(process.env.DATABASE).then(()=>{
        console.log("Connected to db");
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports= connectToDb;