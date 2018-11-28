const express = require('express')
const Joi = require('joi')
const fetch = require('node-fetch')
const middlewares = require('../auth/middleware')

const db = require('../../db/connection.js')
const cafeStatusDB = db.get('cafeStatus')
const logCafeStatusDB = db.get('logCafeStatus')
const thumbUpDB = db.get('thumbUp')
const thumbDownDB = db.get('thumbDown')
const usersDB = db.get('users')

const thumbDownSchema = Joi.object().keys({
    cafeStatusId: Joi.string().required(),
    reason: Joi.string().max(500).required()
})

const router = express.Router()

router.post('/addStatus', (req, res, next)=>{
    
    const cafeStatus = {
        ...req.body,
        createdDate: Date.now(),
        upByUser: 0,
        upByNonUser:0,
        downByUser: 0,
        downByNonUser: 0,
    }
    if (req.user) {
        cafeStatus.username = req.user.username
        //로그인한 유저가 마지막으로 addStatus한거 10분에 한번씩만 가능하게
        cafeStatusDB.find(
            {username: req.user.username},
            {sort:{createdDate:1}}    
        ).then(result =>{
            lastUser = result[result.length-1]

            if (cafeStatus.createdDate - lastUser.createdDate < 10 * 60 * 1000){
                var minute = parseInt((10 * 60 * 1000 - (cafeStatus.createdDate - lastUser.createdDate)) / 1000 / 60) + 1
                const error = new Error(`new status can add in ${minute} minutes later`)
                res.status(429)
                next(error)
            }
        })
    }

    cafeStatusDB.find(
        {cafeId:cafeStatus.cafeId},
        {sort:{createdDate:1}}
        )
        .then(result => {
            
            lastStatus = result[result.length-1]
            //지금 하나도 등록이 안되어있을때 처리가 안되어있음 createdDate가 언디파인으로 되있어
            console.log("lastStautts", lastStatus)

            if (lastStatus === undefined){
                logCafeStatusDB.insert(cafeStatus).then(cafeStatus=>{
                    makeString = cafeStatus._id.toString()
                    const newCafeStatus = {
                        ...cafeStatus,
                        id: makeString
                    }
                    cafeStatusDB.insert(newCafeStatus).then(cafeStatus=>{
                        res.json(cafeStatus)
                    })
                    //get 10points for status add
                    usersDB.findOne({username: req.user.username})
                        .then(userPoint => {
                            userPoint.point += 10
                            usersDB.findOneAndUpdate(
                                {username: req.user.username},
                                userPoint
                            )
                        })
                })
            } else {
                if (cafeStatus.createdDate - lastStatus.createdDate < 10 * 60 * 1000){
                    var minute = parseInt((10 * 60 * 1000 - (cafeStatus.createdDate - lastStatus.createdDate)) / 1000 / 60) + 1
                    const error = new Error(`new status can add in ${minute} minutes later`)
                    res.status(429)
                    next(error)
                }
                else {
                    logCafeStatusDB.insert(cafeStatus).then(cafeStatus=>{
                        makeString = cafeStatus._id.toString()
                        const newCafeStatus = {
                            ...cafeStatus,
                            id: makeString
                        }
                        cafeStatusDB.insert(newCafeStatus).then(cafeStatus=>{
                            res.json(cafeStatus)
                        })
                        //get 10points for status add
                        usersDB.findOne({username: req.user.username})
                            .then(userPoint => {
                                userPoint.point += 10
                                usersDB.findOneAndUpdate(
                                    {username: req.user.username},
                                    userPoint
                                )
                            })
                    })
                }
            }
        })
    
    
})

router.post('/getStatus', (req, res, next)=>{   
    cafeStatusDB.find(
        {cafeId: req.body.id},
        {sort:{createdDate:1}}
        )
        .then(cafeInfo => res.json(cafeInfo))
            // .then(cafeInfo => cafeInfo.json())
            // .then(result => {
            //     res.json(result)
            // })
})


router.post('/thumbUp', middlewares.isLoggedIn, (req, res, next)=>{
    // console.log("req.body", req.body)
    // console.log("req.user", req.user)

    //사용자가 10분안에 한번더 thumbup하는지 체크
    thumbUpDB.find(
        {username: req.user.username},
        {sort:{createdDate:1}}     
    ).then(result=>{
        console.log(result)
        if (result!==null){
            lastResult = result[result.length-1]
            console.log('lastresult', lastResult)
            if(Date.now() - lastResult.createdDate < 10 * 60 * 1000){
                var minute = parseInt((10 * 60 * 1000 - (Date.now() - lastResult.createdDate)) / 1000 / 60) + 1
                const error = new Error(`you can thumbup in ${minute} minute later`)
                res.status(429)
                next(error)
            }
        }
    })
   
    cafeStatusDB.findOne(
        {id:req.body.cafeStatusId}
    ).then(result => {
            console.log("cafeStatusDB", result)
        thumbUpDB.findOne(
            {
                cafeStatusId:req.body.cafeStatusId,
                username: req.user.username
            }
        ).then(thumbUpresult=>{
            console.log("thumbUpresult",thumbUpresult)
            if (thumbUpresult === null){
                const thumbUpdata = {
                    cafeStatusId:req.body.cafeStatusId,
                    username: req.user.username,
                    createdDate: Date.now(),
                    place_name: result.place_name
                }
                //thumbUp 에 없을경우 up해주는거 업데이트
                result.upByUser += 1
                updateData = result
                cafeStatusDB.findOneAndUpdate(
                    {id:req.body.cafeStatusId},
                    updateData
                ).then(cafeStatusResult=>{
                    console.log(cafeStatusResult)
                })
                thumbUpDB.insert(thumbUpdata)
                .then(thumbupResult=>res.json(thumbupResult))

                //get 2points for thumbup
                usersDB.findOne({username: req.user.username})
                        .then(userPoint => {
                            userPoint.point += 2
                            usersDB.findOneAndUpdate(
                                {username: req.user.username},
                                userPoint
                            )
                        })
            }
            else {
                const error = new Error("you already thumbUp")
                res.status(429)
                next(error)
            }
            
        })
    })
    
    
    
})


router.post('/thumbDown', middlewares.isLoggedIn, (req, res, next)=>{
    console.log('req.body', req.body)
    console.log('req.user',req.user)

    thumbDownDB.find(
        {username: req.user.username},
        {sort:{createdDate:1}} 
    ).then(result=>{
        if(result!== null){
            lastResult = result[result.length-1]
            if(Date.now()- lastResult.createdDate < 10 * 60 * 1000){
                var minute = parseInt((10 * 60 * 1000 - (Date.now() - lastResult.createdDate)) / 1000 / 60) + 1
                const error = new Error(`you can thumbDown in ${minute} minute later`)
                res.status(429)
                next(error)
            }
        }
    })

    const result = Joi.validate(req.body, thumbDownSchema)
    console.log(result)
    if (result.error === null){
        cafeStatusDB.findOne(
            {id:req.body.cafeStatusId}
        ).then(result => {
            console.log("result", result)
            thumbDownDB.findOne({
                cafeStatusId:req.body.cafeStatusId,
                username: req.user.username
            }).then(thumbDownResult=> {
                console.log(thumbDownResult)
                if(thumbDownResult === null) {
                    const thumbDowndata = {
                        cafeStatusId: req.body.cafeStatusId, 
                        reason: req.body.reason,
                        username: req.user.username,
                        createdDate: Date.now(),
                        place_name: result.place_name
                    }
                    result.downByUser += 1
                    updateData = result
    
                    if (result.downByUser > 4){
                        cafeStatusDB.remove({id: req.body.cafeStatusId})
                        console.log("removed")
                        thumbDownDB.insert(thumbDowndata)
                        .then(thumbDownResult=>res.json(thumbDownResult))
                    } else {
                        cafeStatusDB.findOneAndUpdate(
                            {id: req.body.cafeStatusId},
                            updateData
                        )
                            .then(cafeStatusResult=>{
                                console.log("updated", cafeStatusResult)
                            })
        
                        thumbDownDB.insert(thumbDowndata)
                        .then(thumbDownResult=>res.json(thumbDownResult))
                    }
                    //minus 1 points for thumbdown
                    usersDB.findOne({username: req.user.username})
                        .then(userPoint => {
                            userPoint.point -= 2
                            usersDB.findOneAndUpdate(
                                {username: req.user.username},
                                userPoint
                            )
                        })
                }
                else {
                    const error = new Error("you already donwDown")
                    res.status(429)
                    next(error)
                }
            })
        })
    } else {
        const error = new Error("validation error")
        res.status(422)
        next(error)
    }
    
})


module.exports = router