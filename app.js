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

app.get("/", (req, res) => {
    res.redirect('https://ayush-baliyan-19.github.io/Portfolio/')
});
app.use('/auth',require('./router/auth'))
app.use(require('./router/forgot'))
app.use(require('./router/mail'))

app.listen(PORT, ()=>{})