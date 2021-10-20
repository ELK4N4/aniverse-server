import mongoose from 'mongoose';

const banSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
    },
    reason: {
        type: String,
    }
});

export default banSchema;