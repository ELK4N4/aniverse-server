const mongoose = require('mongoose');

const postCommentSchema = new mongoose.Schema({
    message: {
        type: String
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PostComment',
        default: null
    },
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('PostComment', postCommentSchema, 'PostComments');