import mongoose from 'mongoose';

const postCommentSchema = new mongoose.Schema({
    message: {
        type: String
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PostComment',
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

export default mongoose.model('PostComment', postCommentSchema, 'PostComments');