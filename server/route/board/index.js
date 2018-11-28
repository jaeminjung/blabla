const express = require('express')
const Joi = require('joi')
const fetch = require('node-fetch')

const db = require('../../db/connection.js')
const suggestPost = db.get('suggestPost')
const logSuggestPost = db.get('logSuggestPost')
const comments = db.get('comment')
const logComments = db.get('logComment')


const postSchema = Joi.object().keys({
    title: Joi.string().max(15).required(),
    context: Joi.string().max(500).required()
})

const commentSchema = Joi.object().keys({
    context: Joi.string().max(100).required(),
    post_id: Joi.string().required()
})

const router = express.Router()


// router.get('/suggestPost', (req, res)=>{
//     suggestPost.find({
//         user_id: req.user._id
//     }).then(posts => {
//         res.json(posts)
//     })
// })

// router.get('/allsuggestPost', (req, res)=>{
//     suggestPost.find().then(posts => {
//         res.json(posts)
//     })
// })

router.post('/suggestPost', (req, res, next)=>{
    const result = Joi.validate(req.body, postSchema)
    if (result.error === null) {
        const post = {
            ...req.body,
            user_id: req.user._id,
            username: req.user.username,
            createdDate: Date.now(),
        }
        //log에 저장 먼저 하고
        logSuggestPost.insert(post).then(post => {
            // console.log(post._id)
            // console.log(post._id.toString())
            makeString = post._id.toString()
            const newPost = {
                ...post,
                id: makeString
            }
            suggestPost.insert(newPost).then(post=>{
                // console.log(post)
                res.json(post)
            })
        })
    } else {
        const error = new Error(result.error)
        res.status(422)
        next(error)
    }
})

//comments
router.post('/comment', (req, res, next)=>{
    const result = Joi.validate(req.body, commentSchema)
    if (result.error === null) {
        const comment = {
            ...req.body,
            user_id: req.user._id,
            username: req.user.username,
            createdDate: Date.now(),
        }
        logComments.insert(comment).then(comment => {
            makeString = comment._id.toString()
            const newComment = {
                ...comment,
                id:makeString
            }
            comments.insert(newComment).then(comment=>{
                console.log(comment)
                const resComment = {
                    value : {
                        author: { username: comment.username},
                        context: comment.context,
                        createdDate: comment.createdDate
                    },
                    post_id: comment.post_id
                }
                res.json(resComment)
            })
            
        })
    } else {
        const error = new Error(result.error)
        res.status(422)
        next(error)
    }
})

router.post('/deletePost', (req, res)=>{
    console.log(req.body.postId)
    suggestPost.findOneAndDelete({_id:req.body.postId}).then((err,result)=>{
        if(err){
            console.log(err)
            res.json(err)
        } else {
            res.json(result)
        }
        
    })
        
})

router.post('/user', (req, res, next)=>{
    console.log(req.body)
    fetch(`http://localhost:5000/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: `{
          user(username:"${req.body.username}") {
            username
            email
            point
            suggestPosts {
              title
              context
              createdDate
              id
              comments {
                context
                createdDate
                post_id
                username
              }
            }
          comments{
            context
            createdDate
          }
          cafeStatus {
            id
            place_name
            cafeStatus
            createdDate
          }
          thumbUps {
            createdDate
            place_name
          }
          thumbDowns {
            createdDate
            place_name
            reason
          }
          }
        }`})
      })
      .then(r =>r.json())
      .then(data => {
        //   console.log(data)
          res.json(data)
      })
})

// this is not using anymore
router.get('/all', (req,res,next)=>{
    fetch(`http://localhost:5000/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: `
          {
            suggestPosts {
              id
              context
              title
              createdDate
              author{
                username
              }
              comments{
                createdDate
                context
                author {
                  username
                }
              }
            }    
          }`})
      })
        .then(r =>r.json())
        .then(data => {
            // console.log(data)
            res.json(data)
        })
})

router.get('/getNotice', (req, res, next)=> {
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: `
          {
            noticePost {
                title
                context
                createdDate
            }    
          }`})
    })
        .then(r=>r.json())
        .then(data => {
            res.json(data)
        })
})

router.post('/pagePost', (req, res, next)=> {
    suggestPost.count().then(count => {
        var postPerPage = req.body.postPerPage
        var skip = count - (req.body.page + 1) * postPerPage
        if ( skip < 0) {
            postPerPage = skip + postPerPage
            var skip = 0
            var isEnd = true
        }
        fetch('http://localhost:5000/graphql', {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        body: JSON.stringify({query: `
            {
                somePosts(skip: ${skip}, limit: ${postPerPage}) {
                id
                context
                title
                createdDate
                author {
                    username
                }
                comments {
                    createdDate
                    context
                    author {
                    username
                    }
                }
                }
            }`
            })
        })
            .then(r=>r.json())
            .then(data=>{
                res.json({
                    ...data,
                    isEnd
                })
            })
    })
 
    
})

module.exports = router
