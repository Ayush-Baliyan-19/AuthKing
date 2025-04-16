const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken");

const time = new Date()
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        pass: {
            type: String,
            required: true,
            deefault: null
        },
        tasksArray: [
            {
                Date: {
                    type: String,
                    default: time.getDate() + "/" + (time.getMonth() + 1) + "/" + time.getFullYear()
                },
                Tasks: [
                    {
                        Heading: {
                            type: String
                        },
                        Objective: {
                            type: String
                        },
                        TaskId: {
                            type: String
                        },
                        time: {
                            type: String
                        },
                        tags: [
                            {
                                tagName: {
                                    type: String
                                },
                                color: {
                                    type: String
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        profilePic: {
            name: {
                type: String,
                required: true
            },
            image: {
                data: Buffer,
                ContentType: String
            }
        },
        passwordOtp: {
            type: String,
            default: null
        },
        otpExpiry: {
            type: Date,
            default: null
        }
    }
)

const User = mongoose.model('USER', userSchema)

module.exports = User;