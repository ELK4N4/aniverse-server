import mongoose from 'mongoose';

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
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model('EpisodeComment', episodeCommentSchema, 'EpisodeComments');