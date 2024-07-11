const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
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
      from: "ayushbaliyan05@gmail.com",
      to: email,
      subject: "Hello ✔",
      text: `${message}`,
    }
    const mailSent = await transport.sendMail(options);
    res.status(200).json({ Success: true, message: "Mail sent successfully" })
  } catch (error) {
    res.status(400).send(error)
  }

}
);


const otpmailer = async (otp, email) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
    },
  })

  const options = {
    from: "ayushbaliyan05@gmail.com",
    to: email,
    subject: "OTP for Authking Registration",
    html: `<p>Dear User,</p>
            <br><br>
            <p>We hope this email finds you well. We are writing to inform you that we have received a request to register with Authking using your email address.</p>
            <br><br>
            <p>To complete the registration process, please enter the following One Time Password (OTP) in the verification field on our website: <strong>${otp}</strong> </p>
            <br><br>
            <p>Please note that this OTP is valid for 5 minutes only and can be used once. If you did not initiate this registration request, kindly ignore this email.</p>
            <br><br>
            <p>If you need any assistance, our support team is always here to help. Please don't hesitate to reach out to us.</p>
            <br><br>
            <p>Best regards,</p>
            <p>The Authking Team</p>`,
  }
  const mailSent = await transport.sendMail(options);
  if (mailSent.accepted) {
    return true
  }
  return false
}
module.exports = router, otpmailer;