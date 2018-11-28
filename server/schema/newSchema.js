const graphql = require('graphql');
const _ = require('lodash');
const db = require('../db/connection.js')
const users = db.get('users')
const suggestPost = db.get('suggestPost')
const comment = db.get('comment')
const cafeStatus = db.get('cafeStatus')
const thumbUpDB = db.get('thumbUp')
const thumbDownDB = db.get('thumbDown')
const noticeDB = db.get('noticePost')

const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLInt,
    GraphQLList,
    GraphQLID
 } = graphql;


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        // _id: {type: GraphQLString},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        // password: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        point: {type: GraphQLInt},
        suggestPosts: {
            type: GraphQLList(SuggestPostType),
            resolve(parent, args){
                return suggestPost.find({username:parent.username})
            }
        },
        comments: {
            type: GraphQLList(CommentType),
            resolve(parent, args){
                return comment.find({username:parent.username})
            }
        },
        cafeStatus: {
            type: GraphQLList(CafeStatusType),
            resolve(parent, args){
                return cafeStatus.find({username:parent.username})
            }
        },
        thumbUps: {
            type: GraphQLList(ThumbUpType),
            resolve(parent, args){
                return thumbUpDB.find({username:parent.username})
            }
        },
        thumbDowns: {
            type: GraphQLList(ThumbDownType),
            resolve(parent, args){
                return thumbDownDB.find({username:parent.username})
            }
        }
    })
})

const SuggestPostType = new GraphQLObjectType({
    name: 'suggestPost',
    fields: ()=>({
        id: {type: GraphQLString},
        user_id: {type: GraphQLString},
        title: {type: GraphQLString},
        context: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args){
                // return _.find(users, {userId:parent.authorId})
                return users.findOne({username:parent.username})
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args){
                return comment.find({post_id:parent.id})
            }
        }

    })
})

const NoticePostType = new GraphQLObjectType({
    name: 'noticePost',
    fields: ()=>({
        id: {type: GraphQLString},
        title: {type: GraphQLString},
        context: {type: GraphQLString},
        createdDate: {type: GraphQLString},
    })
})

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
        context: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        user_id: {type: GraphQLString},
        post_id: {type: GraphQLString},
        username: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args) {
                return users.findOne({username:parent.username})
            }
        }
    })
})

const CafeStatusType = new GraphQLObjectType({
    name: 'CafeStatus',
    fields: () => ({
        id: {type: GraphQLString},
        cafeId : {type: GraphQLString},
        place_name: {type: GraphQLString},
        cafeStatus: {type: GraphQLInt},
        imgUrl: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        upByUser: {type: GraphQLInt},
        downByUser: {type: GraphQLInt},
        author: {
            type: UserType,
            resolve(parent, args) {
                return users.findOne({username:parent.username})
            }
        }
    })
})

const ThumbUpType = new GraphQLObjectType({
    name: 'ThumbUp',
    fields: ()=>({
        createdDate: {type: GraphQLString},
        place_name: {type: GraphQLString},
        cafeStatus: {
            type: CafeStatusType,
            resolve(parent, args){
                return cafeStatus.findOne({id:parent.cafeStatusId})
            }
        },
        author: {
            type: UserType,
            resolve(parent, args) {
                return users.findOne({username:parent.username})
            }
        }
    })
})

const ThumbDownType = new GraphQLObjectType({
    name: 'ThumbDown',
    fields: ()=>({
        createdDate: {type: GraphQLString},
        place_name: {type: GraphQLString},
        reason: {type: GraphQLString},
        cafeStatus: {
            type: CafeStatusType,
            resolve(parent, args){
                return cafeStatus.findOne({id:parent.cafeStatusId})
            }
        },
        author: {
            type: UserType,
            resolve(parent, args) {
                return users.findOne({username:parent.username})
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { username: {type: GraphQLString}},
            resolve(parent, args){
                return users.findOne({username: args.username})
            }
        },
        users: {
            type: GraphQLList(UserType),
            resolve(parent, args){
                return users.find()
            }
        },
        noticePost: {
            type: GraphQLList(NoticePostType),
            resolve(parent, args){
                return noticeDB.find()
            }
        },
        suggestPost: {
            type: GraphQLList(SuggestPostType),
            args: { username: {type: GraphQLString}},
            resolve(parent, args){
                return suggestPost.find({username:args.username})
            }
        },
        suggestPosts: {
            type: GraphQLList(SuggestPostType),
            resolve(parent, args){
                return suggestPost.find()
            }
        },
        comments: {
            type: GraphQLList(CommentType),
            resolve(parent, args){
                return comment.find()
            }
        },
        somePosts: {
            type: GraphQLList(SuggestPostType),
            args: {
                limit: {
                    name:"limit",
                    type: GraphQLInt
                },
                skip: {
                    name: "skip",
                    type: GraphQLInt
                }
            },
            resolve(parent, args) {
                return suggestPost.find(
                    {},                    
                    {
                        "skip": args.skip,
                        "limit": args.limit,
                        // "sort":[['createdDate', 'desc'], ]
                    }
                    )
            }
        },

    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});