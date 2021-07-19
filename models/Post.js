const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    message: {
        type: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PostComment' 
    }],
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Post', postSchema, 'Posts');