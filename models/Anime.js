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
    type: {
        type: String,
        default: "series"
    },
    seasons: {
        type: Number,
        default: 1
    },
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    episodesNumber: {
        type: Number
    },
    genre: {
        type: String
    },    
    summary: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    },
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project' 
    }]
});

module.exports = mongoose.model('Anime', animeSchema, 'Animes');