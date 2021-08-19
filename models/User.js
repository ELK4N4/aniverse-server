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
        select: false
    },
    roles: {
        type: [String],
        default: ['user']
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    memberInFansubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    }]
});

export default mongoose.model('User', userSchema, 'Users');