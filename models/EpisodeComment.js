const mongoose = require('mongoose');

const episodeCommentSchema = new mongoose.Schema({
    message: {
        type: String
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EpisodeComment',
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

module.exports = mongoose.model('EpisodeComment', episodeCommentSchema, 'EpisodeComments');