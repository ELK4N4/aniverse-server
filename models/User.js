import mongoose from 'mongoose';

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
        default: null
    },
    banned: {
        type: Date,
        default: null
    },
    profileImage: {
        type: String,
        default: null
    },
    banner: {
        type: String,
        default: null
    },
    memberInFansubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    }],
    followingFansubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    }],
}, 
{
    timestamps: true,
});

export default mongoose.model('User', userSchema, 'Users');