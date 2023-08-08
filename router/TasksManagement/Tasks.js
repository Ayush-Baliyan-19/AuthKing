const express= require("express")
const router = express.Router()
const SecretKey = process.env.SecretKey
const { body, validationResult } = require("express-validator")
const User = require('../../model/userSchema');
const fetchUser = require("../../middleware/fetchUserFromToken")

router.post("/addTask",fetchUser,[
    body("Date", "Enter a valid date").isString(),
    body("task","Enter a valid task objecct").isObject()
],async (req,res)=>{
    const {task,Date}= req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        const success = false;
        return res.status(400).json({ success, errors   : errors.array()});
    }
    try {
        const userId = req.userId;
        const userfound = await User.findById(userId);
        if (!userfound) {
            return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
        } else {
            const finding=userfound.tasksArray.find(obj=>obj.Date===Date)
            if(finding)
            {
                finding.Tasks.push(task);
            }
            else{
                const newdateobj= {
                    Date:Date,
                    Tasks:[task]
                }
                userfound.tasksArray.push(newdateobj); 
            }
            const userSaved = await userfound.save();
            if(userSaved)
            {
                return res.status(200).json({success:true,message:"Successfully Added the task"})
            }
            res.status(400).json({success:false,message:"Sorry, Unable to save"})
        }
    } catch (error) {
        throw(error);
    }
})

router.get("/getUser",fetchUser, async (req,res)=>{
    try {
        const userId = req.userId;
        const userfound = await User.findById(userId);
        if (!userfound) {
            return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
        } else {
            res.status(200).json({Success:true,TasksList:userfound.tasksArray})
        }
    } catch (error) {
        throw(error);
    }
})


router.get("/getTasksForDetails/:taskId",fetchUser,async (req,res)=>{
    try{
        const userId = req.userId;
        console.log(req.body);
        const userfound= await User.findById(userId);
        if(!userfound)
        {
            return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
        }
        else{
            const taskfound = userfound.tasksArray.find(obj=>obj._id===req.params.taskId)
            if(!taskfound)
            {
                return res.status(400).json({Success:false,message:"An unknown error occured"})
            }
            res.status(200).json({Success:true,Task:taskfound})
        }
    }catch(err){
        res.status(400).json({Success:false,message:err})
    }
})

router.post("/getTasksforDate",[
    body("Date","The Date you entered is not valid").isString()
],fetchUser,async (req,res)=>{
    console.log(req.body)
    const {Date} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        const success = false;
        return res.status(400).json({ success, errors   : errors.array()});
    }
    try {
        const userId = req.userId;
        const userfound = await User.findById(userId);
        if (!userfound) {
            return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
        } else {
            const finding=userfound.tasksArray.find(obj=>obj.Date===Date)
            if(!finding)
            {
                return res.status(400).json({Success:false,message:"An unknown error occured"})
            }
            res.status(200).json({Success:true,TasksForDate:finding})
        }
    }catch(err){
        res.status(400).json({Success:false,message:err})
    }
})
router.post("/getTasksforMonthandYear",[
    body("Month","The Month you entered is not valid").isString().isLength({max:2}),
    body("Year","The Year you entered is not valid").isString().isLength({max:2})
],fetchUser,async (req,res)=>{
    console.log(req.body)
    const {Month,Year} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        const success = false;
        return res.status(400).json({ success, errors: errors.array()});
    }
    try {
        const userId = req.userId;
        const userfound = await User.findById(userId);
        if (!userfound) {
            return res.status(401).send({ error: "(code)Please authenticate using a valid token" });
        } else {
            // console.log(userfound.tasksArray[0].Date.split("/")[1])
            const finding=userfound.tasksArray.filter(obj=>obj.Date.split("/")[1]===Month&&obj.Date.split("/")[2]===Year)
            console.log(finding)
            if(!finding)
            {
                return res.status(400).json({Success:false,message:"An unknown error occured"})
            }
            res.status(200).json({Success:true,TasksForMonth:finding})
        }
    }catch(err){
        res.status(400).json({Success:false,message:err})
    }
})

// router.post("/deleteTask",fetchUser,)

module.exports= router;