import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    role: {
        type: String,
        default: 'חבר צוות'
    },
    permissions: {
        type: [String],
        default: ['']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { _id : false });

export default memberSchema;