const mongoose = require('mongoose');

const memberSchema = {
    roles: {
        type: [String],
        default: ['member']
    },
    permissions: {
        type: [String],
        default: ['']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
};

module.exports = memberSchema;