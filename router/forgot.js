const express = require("express")
const jwt = require("jsonwebtoken")
const router = express.Router()
const SecretKey = process.env.SecretKey
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")

const User= require("../model/userSchema")

router.post('/forgotpass', [
    body("email", "Enter a valid email").isEmail(),
    body("key", "Enter a valid key").isLength({ min: 10 }),
    body("newpass", "Enter a valid password").isLength({ min: 8 })
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

        const userExist = await User.findOne({ email: req.body.email });

        if (!userExist) {
            const success = false;
            res.status(400).json({ success, message: "User does not exist" });
        }

        const hashedpassnew = await bcrypt.hash(req.body.newpass, 10);

        // console.log(userExist);

        if ( await bcrypt.compare(req.body.newpass, userExist.pass)) {
            res.status(200).json({ success: false, message: "Enter a new password, this is an old one" });
        }

        var myuser = { email: req.body.email };

        const isUpdated = await User.updateOne(myuser, {
            $set: {
                pass: hashedpassnew
            }
        })

        const success = true;

        res.status(200).json({ success, message: "Password updated successfully" });
    } catch (err) {
        console.log(err);
        const success = false;
        res.status(400).json({ success, err })
    }
})

module.exports = router;