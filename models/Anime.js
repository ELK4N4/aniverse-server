import mongoose from 'mongoose';
import Project from './Project.js';

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
        default: ''
    },
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project'
    }]
}, 
{
    timestamps: true,
});

animeSchema.post('findOneAndDelete', async function(doc) {
    try {
        await Project.findOneAndDelete({anime: doc._id});
    } catch(err) {
        console.log({err});
    }
});

export default mongoose.model('Anime', animeSchema, 'Animes');