import mongoose from 'mongoose';
import Episode from './Episode.js';

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
}, 
{
    timestamps: true,
});

episodeCommentSchema.post('findOneAndDelete', async function(doc) {
    try {
        await Episode.findOneAndUpdate({comments: doc._id}, { $pull: { comments: doc._id } });
    } catch(err) {
        console.log({err});
    }
});

export default mongoose.model('EpisodeComment', episodeCommentSchema, 'EpisodeComments');