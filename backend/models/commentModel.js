const { mongoose } = require('../db/connection')

const Schema = mongoose.Schema

const commentSchema = new Schema({
    userid: String,
    postId: String,
    comments : 
        [{
            commentator: String,
            commentdate: {
                type: Date, 
                default: +new Date() + 7*24*16*60*1000
            },
            commentData : String
        }]
})


module.exports = mongoose.model('commentSchema',commentSchema)