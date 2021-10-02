import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
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
}, 
{
    timestamps: true,
});

export default mongoose.model('Post', postSchema, 'Posts');