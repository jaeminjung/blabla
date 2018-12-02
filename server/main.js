const express = require('express')
const app = express()

const cors = require('cors')
const logger = require('morgan')

const fs = require('fs')
const path = require('path')
const rfs = require('rotating-file-stream')
var logDirectory = path.join(__dirname, 'log')

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})

const middlewares = require('./route/auth/middleware')
const ratelimiter = require('./rateLimit/index.js')

require('dotenv').config()

app.use(cors()) 

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({
//     extended: true
// }))

const schema = require('./schema/newSchema.js')
const expressGraphQL = require('express-graphql')


app.use(express.json())
app.use(logger('common', {stream:accessLogStream}))
app.use(middlewares.checkTokenSetUser)

app.use(require('connect-history-api-fallback')())
app.use(express.static('public'));

app.use('/auth/login', ratelimiter.loginLimiter)
app.use('/auth/signup', ratelimiter.signupLimiter)
app.use('/board/comment', ratelimiter.boardLimiter)
app.use('/board/suggestPost', ratelimiter.boardLimiter)
// app.use('/status/addStatus', ratelimiter.addStatusLimiter)




const boardRoute = require('./route/board/index.js')
app.use('/board', boardRoute)
// app.use('/board', middlewares.isLoggedIn, boardRoute) //login user 만 요청할수있음

const statusRoute = require('./route/board/cafeStatus.js')
app.use('/status', statusRoute)

//api가져오는 라우터
const apiRoute = require('./route/api.js')
app.use('/api', apiRoute)

//cafe 데이터 가져오는 라우터
const postRoute = require('./route/post.js')
app.use('/post', postRoute)

const auth = require('./route/auth/index.js')
app.use('/auth', auth)

app.use('/graphql', expressGraphQL({
    schema,
    graphiql:true
}))

app.post('/', (req, res)=>{
    
    console.log('/ router', req.user)
    res.json({
        message:' / router ',
        user: req.user
    })
})

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '/public', 'index.html'))
})

function notFound(req, res, next) {
    res.status(404);
    const error = new Error('Not Found - ' + req.originalUrl);
    next(error);
}
  
function errorHandler(err, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
        message: err.message,
        stack: err.stack
    });
}

app.use(notFound);
app.use(errorHandler);

//port listening
const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log("listening on port : ", port)
})