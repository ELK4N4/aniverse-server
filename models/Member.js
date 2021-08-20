import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    roles: {
        type: [String],
        default: ['member']
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