const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const app = express();
const dotenv= require("dotenv")

dotenv.config()



router.post("/mail", async (req, res) => {
  const { email,message } = req.body;
  try {
   
  const transport = nodemailer.createTransport({
    host:"smtp.gmail.com",
    auth:{
      user:process.env.NODEMAILER_USER,
      pass:process.env.NODEMAILER_PASS
    }
  })

    const options={
        from: "ayushbaliyan05@gmail.com", // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: `${message}`, // plain text body
    }
    // send mail with defined transport object
    const mailSent= await transport.sendMail(options);
    console.log(mailSent.accepted)
    res.status(200).send("Mail Sent Successfully")
  } catch (error) {
    res.status(400).send(error)
  }

/*     console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou... */
  }
);
module.exports=router;
