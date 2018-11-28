const graphql = require('graphql')
const _ = require('lodash')
const User = require('../models/user')
const SuggestPost = require('../models/suggestPost')

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLInt,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull
} = graphql;

// dummydata
var users = [
    {userId:'1', email:'j@gmail.com', password:'1_d21d', createdDate:'01/02/18', point:12},
    {userId:'2', email:'d2@gmail.com', password:'2_d21d', createdDate:'02/02/18', point:22},
    {userId:'3', email:'w3@gmail.com', password:'3_d21d', createdDate:'03/02/18', point:32},
    {userId:'4', email:'w4@gmail.com', password:'4_d21d', createdDate:'04/02/18', point:42},
]

var suggestPosts = [
    {postId:'1', authorId:'1', title:'title1', context:'context1', createdDate:'01/02/18'},
    {postId:'2', authorId:'2', title:'title2', context:'context2', createdDate:'02/02/18'},
    {postId:'3', authorId:'3', title:'title3', context:'context3', createdDate:'03/02/18'},
    {postId:'4', authorId:'1', title:'title4', context:'context4', createdDate:'04/02/18'},
]

var comments = [
    {postId:'1', authorId:'1', context:'commet1', createdDate:'01/02/18'},
    {postId:'1', authorId:'1', context:'commet1', createdDate:'01/02/18'},
    {postId:'2', authorId:'2', context:'commet2', createdDate:'01/02/18'},
]

var status = [
    {statusId:'1', authorId:'1', cafeId:'13', cafeStat:11, imgUrl:'qdf', createdDate:'1/1/1'},
    {statusId:'2', authorId:'1', cafeId:'23', cafeStat:21, imgUrl:'qdf', createdDate:'1/1/1'},
    {statusId:'3', authorId:'2', cafeId:'33', cafeStat:31, imgUrl:'qdf', createdDate:'1/1/1'},
]

var thumbUps = [
    {statusId:'1', authorId:'1', createdDate:'01/01/18'}
]

var thumbDowns = [
    {statusId:'1', authorId:'2', createdDate:'01/01/18', reason:'bad'}
]

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: ()=>({
        userId: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        point: {type: GraphQLInt},
        posts: {
            type: new GraphQLList(SuggestPostType),
            resolve(parent, args){
                // return _.filter(suggestPosts, {authorId:parent.userId})
                return SuggestPost.find({authorId:parent.userId})
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args){
                // return _.filter(comments, {authorId:parent.userId})
            }
        },
        statuss: {
            type: new GraphQLList(StatusType),
            resolve(parent, args){
                // return _.filter(status, {authorId:parent.userId})
            }
        },
        thumbUps: {
            type: new GraphQLList(thumbUpType),
            resolve(parent, args){
                // return _.filter(thumbUps, {authorId:parent.userId})
            }
        },
        thumbDowns: {
            type: new GraphQLList(thumbDownType),
            resolve(parent, args){
                // return _.filter(thumbDowns, {authorId:parent.userId})
            }
        }
    })
})

const SuggestPostType = new GraphQLObjectType({
    name: 'SuggestPost',
    fields: ()=>({
        postId: {type: GraphQLString},
        title: {type: GraphQLString},
        context: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args){
                // return _.find(users, {userId:parent.authorId})
                return User.findById(parent.authorId)
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args){
                // return _.filter(comments, {postId:parent.postId})
            }
        }

    })
})

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: ()=>({
        // commentId: {type: GraphQLString},
        context: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args){
                // return _.find(users, {userId:parent.authorId})
            }
        },
        post: {
            type: SuggestPostType,
            resolve(parent, args){
                // return _.find(suggestPosts, {postId:parent.postId})
            }
        }
    })
})

const StatusType = new GraphQLObjectType({
    name: 'status',
    fields: ()=>({
        statusId: {type: GraphQLString},
        cafeId: {type: GraphQLString},
        cafeStat: {type: GraphQLInt},
        imgUrl: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        author: {
            type: UserType,
            resolve(parent, args){
                // return _.find(users, {userId:parent.authorId})
            }
        },
        thumbUps: {
            type: new GraphQLList(thumbUpType),
            resolve(parent, args){
                // return _.filter(thumbUps, {authorId:parent.userId})
            }
        },
        thumbDowns: {
            type: new GraphQLList(thumbDownType),
            resolve(parent, args){
                // return _.filter(thumbDowns, {authorId:parent.userId})
            }
        }
    })
})

const thumbUpType = new GraphQLObjectType({
    name: 'thumbUp',
    fields: ()=> ({
        statusId: {
            type: StatusType,
            resolve(parent, args){
                // return _.find(status, {statusId:parent.statusId})
            }
        },
        author: {
            type: UserType,
            resolve(parent, args){
                // return _.find(users, {userId:parent.authorId})
            }
        },
        createdDate: {type:GraphQLString}
    })
})

const thumbDownType = new GraphQLObjectType({
    name:'thumbDown',
    fields: () => ({
        status: {
            type: StatusType,
            resolve(parent, args){
                // return _.find(status, {statusId:parent.statusId})
            }
        },
        author: {
            type: UserType,
            resolve(parent, args){
                // return _.find(users, {userId:parent.authorId})
            }
        },
        createdDate: {type:GraphQLString},
        reason : {type: GraphQLString}
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        User: {
            type: UserType,
            args: {userId: {type:GraphQLString}},
            resolve(parent, args){
                // return _.find(users, {userId:args.userId})
                return User.findById(args.userId)
            }
        },
        SuggestPost: {
            type: SuggestPostType,
            args: {postId: {type:GraphQLString}},
            resolve(parent, args){
                // return _.find(suggestPosts, {postId:args.postId})
                return SuggestPost.findById(args.postId)
            }
        },
        // Comment: {
        //     type: CommentType,
        //     args: {commentId: {type:GraphQLString}},
        //     resolve(parent, args){
        //         return _.find(comments, {commentId:args.commentId})
        //     }
        // },
        SuggestPosts: {
            type: new GraphQLList(SuggestPostType),
            resolve(parent, args){
                // return suggestPosts
                return SuggestPost.find({})
            }
        },
        Users : {
            type: new GraphQLList(UserType),
            resolve(parent, args){
                // return users
                return User.find({})
            }
        },
        Status: {
            type: new GraphQLList(StatusType),
            resolve(parent, args){
                // return status
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                userId: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                createdDate: {type: GraphQLString},
                point: {type: GraphQLInt}
            },
            resolve(parent, args){
                let user = new User({
                    userId: args.userId,
                    email: args.email,
                    password: args.password,
                    createdDate: args.createdDate,
                    point: args.point
                })
                return user.save()
            }
        },
        addSuggestPost: {
            type: SuggestPostType,
            args: {
                title: {type: new GraphQLNonNull(GraphQLString)},
                context: {type: new GraphQLNonNull(GraphQLString)},
                createdDate: {type: GraphQLString},
                authorId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                let suggestPost = new SuggestPost({
                    title:args.title,
                    context: args.context,
                    createdDate: args.createdDate,
                    authorId: args.authorId
                })
                return suggestPost.save()
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation:Mutation
})