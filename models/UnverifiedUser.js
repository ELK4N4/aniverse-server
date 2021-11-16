import mongoose from 'mongoose';

const unverifiedUserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, 
{
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

export default mongoose.model('UnverifiedUser', unverifiedUserSchema, 'UnverifiedUsers');