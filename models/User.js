import mongoose from 'mongoose';
import owners from '../utils/owners.js';

const userSchema = new mongoose.Schema({
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
    role: {
        type: String,
        default: null
    },
    permissions: {
        type: [String],
        default: []
    },
    banned: {
        type: Date,
        default: null
    },
    avatar: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    memberInFansubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    }],
    followingFansubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    }],
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

userSchema.virtual('owner').get(function () {
    return this.owner = owners.isOwner(this._id);
});

export default mongoose.model('User', userSchema, 'Users');