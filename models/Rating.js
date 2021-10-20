import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    },
    score: {
        type: Number,
    },
});

export default mongoose.model('Rating', ratingSchema, 'Ratings');