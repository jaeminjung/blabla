const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const API_KEY = 'a9affc4958c61e7183588480b06e7808'

//request api...
router.get('/daum/1', (req, res) => {
    res.redirect("https://dapi.kakao.com/v2/maps/sdk.js?appkey=a9affc4958c61e7183588480b06e7808")
});


router.get('/daum/2', (req, res) => {
    console.log("this is daum/api/2")
    fetch(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=a9affc4958c61e7183588480b06e7808&libraries=services`, {
        method: 'GET',
        headers: { 
            'content-type':'application/json'}
        })
            .then(response => response.buffer())
            .then(buffer=>{
                // console.log(buffer)
                var chunk = buffer.toString()
                // console.log(chunk)
                res.send(chunk)
            })
});

router.get('/google', (req, res) => {
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyABDx8gkR_B5DVet_-EZKOImsB5JIRTI04", {
        method: 'POST',
        headers: { 'content-type':'application.json'}
    })
    .then(response=>response.json())
    .then(datas => {
        console.log('this is /google/api', datas)
        res.json(datas)
    })
    // res.redirect("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDpaZPJsBE2YWnDwVxUS34IjZGtMmEfRvc")
})


router.get('/locationFirebase', (req, res)=>{
    // fetch('http://localhost:3000')
    //     .then(r=>r.json())
    //     .then(r=>{
    //         res.json(r)
    //     })
    res.redirect('https://findseat-221319.firebaseapp.com/')    
})

router.get('/locationFinal', (req, res)=>{
    res.json({
        lat:_lat,
        lng:_lng
    })
})

router.post('/location', (req, res)=>{
    console.log(req.body)
    var _lat = req.body.lat
    var _lng = req.body.lng
    location = {
        lat: req.body.lat,
        lng: req.body.lng
    }
    res.json({
        message: 'your location',
        location
    })
    // fetch(`http://localhost:3000`)
    //     .then(r => {
    //         console.log(r)
    //         r.json()})
    //     .then(r => console.log('testing', r))
    
})


router.get('/', (req, res)=>{
    res.json({
        message:'this is api router'
    })
})

module.exports = router