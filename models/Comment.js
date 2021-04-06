const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    message: {
        type: String
    },
    added_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Comment', commentSchema, 'Comments');