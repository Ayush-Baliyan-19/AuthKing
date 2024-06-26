const dotenv= require("dotenv")
const express = require ("express");
const app = express();
const cors= require('cors')
const connectToDb = require("./db.js")

dotenv.config()

connectToDb();

app.use(cors())

app.use(express.json());



const PORT=process.env.PORT || 5000;

app.use('/auth',require('./router/auth'))
app.use(require('./router/forgot'))
app.use(require('./router/mail'))
app.use('/user',require('./router/TasksManagement/Tasks'))

app.listen(PORT, ()=>{})