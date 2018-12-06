const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('../../db/connection.js')
const users = db.get('users')
users.createIndex('username', {unique:true})

const router = express.Router()

const schema = Joi.object().keys({
    username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(2).max(20).required(),
    password: Joi.string().trim().min(6).required(),
    email: Joi.string().email({ minDomainAtoms: 2 })
})

function createTokenSendResponse(user, res, next) {
    const payload = {
        _id: user._id,
        username: user.username
    }
    jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: 60 * 60 *24 //'1d'
    }, (err, token) => {
        if(err){
            respondError422(res, next)
        } else {
            res.json({token})
        }
    })
}


router.get('/', (req, res)=>{
    res.json({
        message: "this is auth"
    })
})

router.post('/checkToken', (req, res)=>{
    const authoHeader = req.get('authorization')
    if(authoHeader) {
        const token = authoHeader.split(' ')[1]
        if(token) {
            jwt.verify(token, process.env.TOKEN_SECRET, (error, user)=>{
                if(error){
                    console.log(error)
                }
                
                res.json(user)
            })
        }
    }
})

router.post('/signup', (req, res, next)=>{
    const result = Joi.validate(req.body, schema)
    if(result.error === null){
        users.findOne({
            username: req.body.username,
        }).then(user=>{
            console.log('auth user', user)
            if(user) {
                const error = new Error('username is already existed')
                res.status(409)
                next(error)
            } else{
                users.findOne({
                    email: req.body.email,
                }).then(emailUser=>{
                    console.log('auth emailuser', emailUser)
                    if (emailUser){
                        const error = new Error('email is already in used')
                        res.status(409)
                        next(error)
                    } else {
                        bcrypt.hash(req.body.password.trim(), 11).then(hashedPassword=>{
                            const newUser = {
                                username: req.body.username,
                                password: hashedPassword,
                                email: req.body.email,
                                createdDate: Date.now(),
                                point: 0
                            }
                            users.insert(newUser).then(insertedUser=>{
                                createTokenSendResponse(insertedUser, res, next)
                            })
                        })
                    }
                })                    
            }
        })
    } else {
        res.status(422)
        next(result.error)
    }
    
    // if(result.error === null){
    //     users.find({
    //         username: req.body.username,
    //     }).then(user=>{
    //         if(user) {
    //             const error = new Error('username is already existed')
    //             res.status(409)
    //             next(error)
    //         } else{
    //             bcrypt.hash(req.body.password.trim(), 11).then(hashedPassword=>{
    //                 const newUser = {
    //                     username: req.body.username,
    //                     password: hashedPassword,
    //                     email: req.body.email,
    //                     createdDate: Date.now(),
    //                     point: 0
    //                 }
    //                 users.insert(newUser).then(insertedUser=>{
    //                     createTokenSendResponse(insertedUser, res, next)
    //                 })
    //             })
                    
    //         }
            
    //     })
    // } else {
    //     res.status(422)
    //     next(result.error)
    // }
})

function respondError422(res, next) {
    res.status(422)
    const error = new Error('Unable to login')
    next(error)        
}

router.post('/login', (req, res, next) => {
    const result = Joi.validate(req.body, schema)
    if(result.error === null){
        users.findOne({
            username: req.body.username,
        }).then(user => {
            if(user) {
                bcrypt.compare(req.body.password, user.password).then(result => {
                    if (result) {
                        
                        createTokenSendResponse(user, res, next)     

                    } else {
                        respondError422(res, next)
                    }
                })
            } else {
                respondError422(res, next)
            }
        })
    } else {
        respondError422(res, next)
    }
    
    
})

module.exports = router