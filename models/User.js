const mongoose = require('mongoose');

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
    roles: {
        type: [String],
        default: ['user']
    },
    permissions: {
        type: [String],
        default: null
    },
    profile_image: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    member_in_fansubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    }]
});

module.exports = mongoose.model('User', userSchema, 'Users');