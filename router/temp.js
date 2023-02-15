const express = require("express")
const app=express.Router();
const fs= require("fs");

app.post('/ahuahu', async (req,res)=>{
    const { data }=req.body;
    console.log(data)
    fs.writeFile('data.json', data, err => {
        if (err) {
          console.log('Error writing file', err);
        } else {
          console.log('Successfully wrote file');
          res.status(200);
        }
      });
})

module.exports=app;