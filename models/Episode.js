import mongoose from 'mongoose';
import Project from './Project.js';

const episodeSchema = new mongoose.Schema({
    anime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    season: {
        type: Number,
        default: 1
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
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    addedByFansub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EpisodeComment' 
    }]
});

episodeSchema.post('save', async function(_savedDoc) {
    try {
        await Project.findByIdAndUpdate({_id: this.project}, { $addToSet: { episodes: this._id } });
    } catch(err) {
        console.log({err});
    }
});

episodeSchema.post('findOneAndRemove', async function(doc) {
    try {
        await Project.findByIdAndUpdate({_id: doc.project}, { $pull: { episodes: doc._id } });
    } catch(err) {
        console.log({err});
    }
});

export default mongoose.model('Episode', episodeSchema, 'Episodes');