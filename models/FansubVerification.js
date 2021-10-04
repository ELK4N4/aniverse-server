import mongoose from 'mongoose';
import Project from './Project.js';
import User from './User.js';
import memberSchema from './Member.js';

const fansubVerificationSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    createdByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    avatar: {
        type: String,
        default: null
    },
}, 
{
    timestamps: true,
});

// TODO: post fansub verification delete middelware

// fansubVerificationSchema.post('findOneAndDelete', async function(doc) {
//     try {
//         const usersArr = [];
//         doc.members.forEach(member => {
//             usersArr.push(member.userId);
//         });
//         await User.updateMany({ _id: { $in: usersArr }}, { $pull: { memberInFansubs: doc._id } });
//         const projects = await Project.find({ fansub: doc._id }); // TODO: get only IDs
//         projects.forEach(async project => {
//             await Project.findOneAndDelete({ _id: project._id });
//         });
//     } catch(err) {
//         console.log({err});
//     }
// });

export default mongoose.model('FansubVerificationSchema', fansubVerificationSchema, 'FansubsVerificationSchema');