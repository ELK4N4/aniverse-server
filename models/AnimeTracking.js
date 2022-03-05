import mongoose from 'mongoose';

const animeTrackingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    },
    status: {
        type: String,
    },
    currentEpisode: {
        type: Number,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('AnimeTracking', animeTrackingSchema, 'AnimeTrackings');