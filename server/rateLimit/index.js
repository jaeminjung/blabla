const rateLimit = require('express-rate-limit')


const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 5,
    message: "Too many attempts, please try again after 20 minutes",
    handler: function(req, res, next){
        res.status(429)
        const error = new Error("Too many attempts, please try again after 30 minutes")
        next(error)
    }
})

const signupLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 5,
    message: "Too many attempts, please try again after 20 minutes",
    handler: function(req, res, next){
        res.status(429)
        const error = new Error("Too many attempts, please try again after 30 minutes")
        next(error)
    }
})

const boardLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 50,
    handler: function(req, res, next){
        res.status(429)
        const error = new Error("Too many post or comments, please try again later")
        next(error)
    }
})

const addStatusLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    handler: function(req, res, next){
        res.status(429)
        const error = new Error("Too many attempt to add Status, please try again later")
        next(error)
    }
})


module.exports = {
    loginLimiter,
    signupLimiter,
    boardLimiter,
    addStatusLimiter
}