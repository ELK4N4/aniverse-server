import mongoose from 'mongoose';

const banSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expired: {
        type: Date,
    },
    reason: {
        type: String,
    }
});

export default mongoose.model('Ban', banSchema, 'Bans');