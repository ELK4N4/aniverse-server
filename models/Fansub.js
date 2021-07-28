const mongoose = require('mongoose');
const memberSchema = require('./Member');
const User = require('./User');

const fansubSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    createdByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: null
    },
    members: [memberSchema],
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project' 
    }],
});

// fansubSchema.post("save", async function(savedDoc) {
//     try {
//         const user = await User.findById({_id: this.createdByUser});
//         user.memberInFansubs.push(this._id);
//         await user.save();
//     } catch(err) {
//         console.log({err});
//     }
// });

module.exports = mongoose.model('Fansub', fansubSchema, 'Fansubs');