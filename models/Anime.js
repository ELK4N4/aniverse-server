import mongoose from 'mongoose';

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
        default: 'series'
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

export default mongoose.model('Anime', animeSchema, 'Animes');