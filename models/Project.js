const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    anime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    },
    fansub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    },
    status: {
        type: String,
        default: 'פעיל'
    },
    added_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    episodes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Episode' 
    }]
});

module.exports = mongoose.model('Project', projectSchema, 'Projects');