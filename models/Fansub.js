const mongoose = require('mongoose');
const memberSchema = require('./Member');

const fansubSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    created_by_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    },
    members: { 
        type: [memberSchema]
    },
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project' 
    }],
});

module.exports = mongoose.model('Fansub', fansubSchema, 'Fansubs');