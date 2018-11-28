const mongoose = require('mongoose')
const Schema = mongoose.Schema

const suggestPostSchema = new Schema({
    authorId: String,
    title: String,
    context: String,
    createdDate: {type:Date, default: Date.now}
})

module.exports = mongoose.model('SuggestPost', suggestPostSchema)