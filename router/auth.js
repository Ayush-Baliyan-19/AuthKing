const express = require("express")
const jwt = require("jsonwebtoken")
const router = express.Router()
const SecretKey = process.env.SecretKey
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const JWT_SECRET= process.env.JWT_SECRET
// const fetchUser= require("../middleware/fetchUserFromToken")

const User = require('../model/userSchema');
const invalidmailer = require("./mail")
const fetchUser = require("../middleware/fetchUserFromToken")

router.get("/", (req, res) => {
    res.send("Hello This is Ayush Baliyan");
});
router.post("/register", [
    body("email", "Enter a valid email address").isEmail(),
    body("name", "Enter a valid name of minimum 3 digits").isLength({ min: 3 }),
    body("pass", "Enter valid password").isLength({ min: 8 }),
    body("cpass", "Enter valid password").isLength({ min: 8 }),
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
            return res.status(422).send("User already exist")
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
        console.log(err);
    }
});

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

        const { email, pass } = req.body

        const userLogin = await User.findOne({ email: req.body.email })

        if (!userLogin) {
            return res.status(400).send("Invalid Credentialls for Userlogin")
        }

        const isMatch = await bcrypt.compare(pass, userLogin.pass);

        if (!isMatch) {
            invalidmailer(userLogin)
            return res.status(400).send("Invalid password")
        }

        const token = jwt.sign({ _id: userLogin._id }, JWT_SECRET)
        // console.log(token)

        const success = true;
        res.status(200).json({ success, token })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

router.post('/verify', fetchUser, [
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

        const userId=req.userId;
        console.log(userId);
        const userfound= await User.findById(userId);
        if (!userfound) {
			return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
		} else {
			res.send(userfound);
		}

    } catch (err) {
        res.status(400).json({ success: false, error: err })
    }
})

module.exports = router;