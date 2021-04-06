const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    name: {
        hebrew: {
            type: String,
        },
        english: {
            type: String,
        },
        japanese: {
            type: String,
        }
    },
    added_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    episodes_number: {
        type: Number
    },
    genre: {
        type: String
    },    
    summary: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    },
    fansubs: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Fansub' 
    }],
    episodes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Episode' 
    }]
});

module.exports = mongoose.model('Anime', animeSchema, 'Animes');