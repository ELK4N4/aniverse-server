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
    genres: {
        type: [String]
    },
    summary: {
        type: String
    },
    image: {
        type: String,
        default: null
    },
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project'
    }]
}, 
{
    timestamps: true,
});

export default mongoose.model('Anime', animeSchema, 'Animes');