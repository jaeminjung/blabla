const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    userId: String,
    email: String,
    password: String,
    point: Number,
    createdDate: {type:Date, default: Date.now}

})

module.exports = mongoose.model('User', userSchema)