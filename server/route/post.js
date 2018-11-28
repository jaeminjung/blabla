const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')


//https://developers.kakao.com/docs/restapi/local 참고해서 더 수정하기
//내위치받고 주변 500원에서 찾기
router.post('/myLocCafes', (req, res)=>{
    datas = []
    page = 1
    var options = {
        "method": "GET",
        "headers": {
          "Authorization": "KakaoAK a9affc4958c61e7183588480b06e7808"
        },
    };
    if (req.body.lat.toString()) {
        var lat = req.body.lat.toString()
        var lng = req.body.lng.toString()
    } else {
        res.status(422)
        res.json({
            message:'something server went wrong'
        })
    }
    function getData(page){    
        fetchAdd = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&radius=350&y=${lat}&x=${lng}&page=${page}`
        // console.log('fetchAdd', fetchAdd)
        fetch(fetchAdd, options)
        .then(response => response.json())
        .then(response1 => {
            // console.log(response1)
            response1.documents.forEach(data => {
                datas.push(data)
            })
            // console.log('data', datas)
            if (!response1.meta.is_end){
                page += 1
                getData(page)
            } else {
                console.log('this is /myLocCafes console', lat, lng)
                console.log('datas send completed')
                res.json(datas)   
            }
        })          
    }
    getData(page)

})

//현재 지도보이는곳에서 요청한거 찾기
router.post('/myMapCafes', (req, res)=>{
    datas = []
    page = 1
    var options = {
        "method": "GET",
        "headers": {
          "Authorization": "KakaoAK a9affc4958c61e7183588480b06e7808"
        }
    }
    if (req.body) {
        var leftCoord = req.body.leftCoord
        var leftLat = leftCoord.leftLat
        var leftLng = leftCoord.leftLng
        var rightCoord = req.body.rightCoord
        var rightLat = rightCoord.rightLat
        var rightLng = rightCoord.rightLng
    } else {
        res.status(422)
        res.json({
            message:'something server went wrong'
        })
    }

    function getData(page) {
        fetchAdd = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&rect=${leftLng},${leftLat},${rightLng},${rightLat}&page=${page}`
        // console.log('page', page)
        

        fetch(fetchAdd, options)
        .then(response => response.json())
        .then(response1 => {
            response1.documents.forEach(data => {
                datas.push(data)
            })
            // console.log('data', data)
            if (!response1.meta.is_end){
                page += 1
                getData(page)
            } else {
                console.log('this is /myMapCafes post')
                console.log('datas send completed')
                res.json(datas)   
            }
        })      
    }
    getData(page)
})

router.post('/keyword', (req, res)=>{
    
    var keyword = req.body.keyword
    console.log(encodeURI(keyword))
    console.log(keyword)

    keyword = encodeURI(keyword)
    var options = {
        'method': 'GET',
        'headers': {
            'Authorization': 'KakaoAK a9affc4958c61e7183588480b06e7808',
        }
    }
    fetch(`https://dapi.kakao.com/v2/local/search/keyword?query=${keyword}`, options)
        .then(respond => respond.json())
        .then(respond => {
            // console.log(respond)
            res.json(respond)
        })

    
})

router.get('/', (req, res)=>{
    res.json({
        message:'this is post route'
    })
})
module.exports = router