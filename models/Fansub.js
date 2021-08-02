const mongoose = require('mongoose');
const Episode = require('./Episode');
const memberSchema = require('./Member');
const Project = require('./Project');
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

fansubSchema.post("findOneAndRemove", async function(doc) {
    try {
        const usersArr = [];
        doc.members.forEach(member => {
            usersArr.push(member.userId);
        })
        await mongoose.model('User').updateMany({ _id: { $in: usersArr }}, { $pull: { memberInFansubs: doc._id } });
        const projects = await mongoose.model('Project').find({ fansub: doc._id }); // TODO: get only IDs
        projects.forEach(async project => {
            await mongoose.model('Project').findOneAndRemove({ _id: project._id });
        })
    } catch(err) {
        console.log({err});
    }
});

module.exports = mongoose.model('Fansub', fansubSchema, 'Fansubs');