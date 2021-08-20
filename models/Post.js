import mongoose from 'mongoose';

const postSchema = new Schema({
    message: {
        type: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PostComment' 
    }],
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model('Post', postSchema, 'Posts');