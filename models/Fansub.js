import mongoose from 'mongoose';
import Project from './Project.js';
import User from './User.js';
import memberSchema from './Member.js';

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
    followers: {
        type: Number,
        default: 0
    },
});

fansubSchema.post('findOneAndDelete', async function(doc) {
    try {
        const usersArr = [];
        doc.members.forEach(member => {
            usersArr.push(member.userId);
        });
        await User.updateMany({ _id: { $in: usersArr }}, { $pull: { memberInFansubs: doc._id } });
        const projects = await Project.find({ fansub: doc._id }); // TODO: get only IDs
        projects.forEach(async project => {
            await Project.findOneAndDelete({ _id: project._id });
        });
    } catch(err) {
        console.log({err});
    }
});

export default mongoose.model('Fansub', fansubSchema, 'Fansubs');