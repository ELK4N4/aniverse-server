import mongoose from 'mongoose';
import Anime from './Anime.js';
import Episode from './Episode.js';
import Fansub from './Fansub.js';

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
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    episodes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Episode' 
    }]
}, 
{
    timestamps: true,
});

projectSchema.post('save', async function(_savedDoc) {
    try {
        await Anime.findByIdAndUpdate({_id: this.anime}, { $addToSet: { projects: this._id } });
        await Fansub.findByIdAndUpdate({_id: this.fansub}, { $addToSet: { projects: this._id } });
    } catch(err) {
        console.log({err});
    }
});

projectSchema.post('findOneAndDelete', async function(doc) {
    try {
        await Anime.findByIdAndUpdate({_id: doc.anime}, { $pull: { projects: doc._id } });
        await Fansub.findByIdAndUpdate({_id: doc.fansub}, { $pull: { projects: doc._id } });
        doc.episodes.forEach(async episode => {
            await mongoose.model('Episode').findByIdAndDelete(episode);
        })
    } catch(err) {
        console.log({err});
    }
});

export default mongoose.model('Project', projectSchema, 'Projects');