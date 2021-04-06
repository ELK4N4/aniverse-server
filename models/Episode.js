const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    anime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    },
    name: {
        type: String,
        require: true,
    },
    number: {
        type: Number,
        require: true,
    },
    link: {
        type: String,
        require: true
    },
    post: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    added_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    added_by_fansub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment' 
    }]
});

module.exports = mongoose.model('Episode', episodeSchema, 'Episodes');