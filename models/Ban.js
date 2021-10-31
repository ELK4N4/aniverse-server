import mongoose from 'mongoose';

const banSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expire: {
        type: Date,
    },
    reason: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Ban', banSchema, 'Bans');