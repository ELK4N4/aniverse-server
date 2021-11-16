import mongoose from 'mongoose';
import Project from './Project.js';
import User from './User.js';
import memberSchema from './Member.js';

const unverifiedFansubSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    createdByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    avatar: {
        type: String,
        default: ''
    },
    banner: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, 
{
    timestamps: true,
});

export default mongoose.model('UnverifiedFansub', unverifiedFansubSchema, 'UnverifiedFansubs');