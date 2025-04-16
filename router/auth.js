const express = require("express")
const jwt = require("jsonwebtoken")
const router = express.Router()
const SecretKey = process.env.SecretKey
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const JWT_SECRET = process.env.JWT_SECRET
const nodemailer= require("nodemailer")
const User = require('../model/userSchema');
const fetchUser = require("../middleware/fetchUserFromToken")
const otpmailer = require("./mail")


router.post("/email/otp", [
    body("email", "Enter a valid email address").isEmail(),
    body("key", "Enter a valid key").isLength({ min: 10 }),
], async (req, res) => {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const success = false;
        return res.status(400).json({ success, errors: errors.array() });
    }

    if (req.body.key != SecretKey) {
        return res.status(400).json({ success: false, error: "NOT ALLOWED , WRONG KEY DETECTED" });
    }

    try {
        let userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(422).send("User already exist")
        }

        function generate(n) {
            var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

            if (n > max) {
                return generate(max) + generate(n - max);
            }

            max = Math.pow(10, n + add);
            var min = max / 10; // Math.pow(10, n) basically
            var number = Math.floor(Math.random() * (max - min + 1)) + min;

            return ("" + number).substring(add);
        }
        var otp= generate(6);
        const otpsent= await(otpmailer(otp,email))
        if(otpsent)
        {
            const hashedOTP= await bcrypt.hash(otp,10);
            const success = true;
            res.status(200).json({ success , hashedOTP:hashedOTP  })
        }

    } catch (err) {
        res.status(400).json({ status: false, error: err })
    }
});

router.post("/register/email/verify", [
    body("email", "Enter a valid email address").isEmail(),
    body("name", "Enter a valid name of minimum 3 digits").isLength({ min: 3 }),
    body("pass", "Enter valid password").isLength({ min: 8 }),
    body("key", "Enter a valid key").isLength({ min: 10 }),
], async (req, res) => {
    const { name, email, pass } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const success = false;
        return res.status(400).json({ success, errors: errors.array() });
    }

    if (req.body.key != SecretKey) {
        return res.status(400).json({ success: false, error: "NOT ALLOWED , WRONG KEY DETECTED" });
    }

    try {
        let userExist = await User.findOne({ email: email });

        if (userExist) {
            return res.status(422).json({success:false,message:"User already exist"})
        }

        const hashedPass = await bcrypt.hash(pass, 10)
        const user = new User({ name, email, pass: hashedPass });

        const authKey = jwt.sign({ id: user._id }, JWT_SECRET);

        const savedata = await user.save();

        if (savedata) {
            const success = true;
            res.status(201).json({ success, authKey })
        }
    } catch (err) {
        res.status(400).json({ status: false, error: err })
    }
});

const invalidmailer = async (user) => {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
      },
    })
  
    const options = {
      from: "ayushbaliyan05@gmail.com",
      to: user.email,
      subject: "🔴🔴[ALERT] Invalid login attempt !!🔴🔴",
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
        </div>`,
    }
    const mailSent= await transport.sendMail(options)
  }

router.post('/login', [
    body("email", "Enter a valid email address").isEmail(),
    body("key", "Enter a valid key").isLength({ min: 10 }),
    body("pass", "Enter valid password").isLength({ min: 8 })
], async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const success = false;
            return res.status(400).json({ success, errors: errors.array() });
        }
        if (req.body.key != SecretKey) {
            return res.status(400).json({ success: false, error: "NOT ALLOWED , WRONG KEY DETECTED" });
        }

        const userLogin = await User.findOne({ email: req.body.email })

        if (!userLogin) {
            return res.status(400).json({success:false,message:"Invalid Credentialls for Userlogin"})
        }

        const isMatch = await bcrypt.compare(req.body.pass, userLogin.pass);

        if (!isMatch) {
            invalidmailer(userLogin)
            return res.status(400).json({success:false,message:"Invalid password"})
        }

        const token = jwt.sign({ _id: userLogin._id }, JWT_SECRET)

        const success = true;
        res.status(200).json({ success, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/user/getDetails', fetchUser, [
    body("key", "Enter a valid key").isLength({ min: 10 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const success = false;
            return res.status(400).json({ success, errors: errors.array() });
        }
        if (req.body.key != SecretKey) {
            return res.status(400).json({ success: false, error: "NOT ALLOWED , WRONG KEY DETECTED" });
        }

        const userId = req.userId;
        const userfound = await User.findById(userId);
        if (!userfound) {
            return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
        } else {
            // const userObj={userfound}
            res.status(200).json(userfound);
        }

    } catch (err) {
        res.status(400).json({ success: false, error: err })
    }
})

module.exports = router;