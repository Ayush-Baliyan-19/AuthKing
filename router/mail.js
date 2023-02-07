const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const app = express();
const dotenv = require("dotenv")

dotenv.config()

router.post("/mail", async (req, res) => {
  const { email, message } = req.body;
  try {

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
      }
    })

    const options = {
      from: "ayushbaliyan05@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Hello ✔", // Subject line
      text: `${message}`, // plain text body
    }
    // send mail with defined transport object
    const mailSent = await transport.sendMail(options);
    console.log(mailSent.accepted)
    res.status(200).send("Mail Sent Successfully")
  } catch (error) {
    res.status(400).send(error)
  }

}
);

const invalidmailer = async (user) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
    },
  })

  const options = {
    from: "ayushbaliyan05@gmail.com", // sender address
    to: user.email, // list of receivers
    subject: "🔴🔴[ALERT] Invalid login attempt !!🔴🔴", // Subject line
    html: `<div align=center>  
        <div style="margin:10vw; margin-top:10vh; margin-bottom:10vh; border:1px solid black; border-radius:10px; padding:20px">
        <div style="width: 90%; height: 17vh; background: url('https://raw.githubusercontent.com/Ayush-Baliyan-19/AuthKing/main/router/Auhtking-Banner.png') no-repeat center; background-size: contain;"></div>
        <H1>ALERT!!</H1>
        <H2>Suspicious activity recorded on your account</H2>
        <h3 style="text-align:left">Dear ${user.name}, <br><br>
          This email is to inform you that we have detected a suspicious login attempt on your account from a different computer. For your security, we have temporarily suspended access to your account. <br><br>
          
          If you made this attempt, please ignore this email and your access will be restored in 24 hours. If you did not make this attempt, please take immediate action to secure your account. <br><br>
          
          To regain access to your account, please follow these steps: <br><br>
          
          Change your password to a strong and unique one
          Enable two-factor authentication to add an extra layer of security to your account
          Check your account activity logs to see if any unauthorized actions were performed
          If you need assistance, please do not hesitate to contact our support team. <br><br>
          
          Thank you for your attention to this matter. <br><br>
          
          Authking</h3>
      </div>`, // plain text body
  }
  // send mail with defined transport object
  const mailSent = await transport.sendMail(options);
  // console.log(mailSent.accepted)
  // res.status(200).send("Mail Sent Successfully")
}
module.exports = router;
module.exports = invalidmailer;
