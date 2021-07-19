const mongoose = require('mongoose');
const Anime = require('./Anime');
const Fansub = require('./Fansub');

const projectSchema = new mongoose.Schema({
    anime: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime'
    },
    season: {
        type: Number,
        default: 1
    },
    fansub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fansub'
    },
    status: {
        type: String,
        default: 'פעיל'
    },
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    episodes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Episode' 
    }]
});

projectSchema.post("save", async function(savedDoc) {
    try {
        // const anime = await Anime.findById({_id: this.anime});
        // anime.projects.push(this._id);
        // await Anime.findByIdAndUpdate({_id: this.anime}, anime);
        await Anime.findByIdAndUpdate({_id: this.anime}, { $push: { projects: this._id } });
        // const fansub = await Fansub.findById({_id: this.fansub});
        // fansub.projects.push(this._id);
        // await Fansub.findByIdAndUpdate({_id: this.fansub}, fansub);
        await Fansub.findByIdAndUpdate({_id: this.fansub}, { $push: { projects: this._id } });
    } catch(err) {
        console.log({err});
    }
});

projectSchema.post("findOneAndRemove", async function(doc) {
    try {
        // const anime = await Anime.findById({_id: doc.anime});
        // anime.projects = anime.projects.filter(project => !doc._id.equals(project));
        // await Anime.findByIdAndUpdate({_id: doc.anime}, anime);
        // const fansub = await Fansub.findById({_id: doc.fansub});
        // fansub.projects = fansub.projects.filter(project => !doc._id.equals(project));
        // await Fansub.findByIdAndUpdate({_id: doc.fansub}, fansub);
        await Anime.findByIdAndUpdate({_id: doc.anime}, { $pull: { projects: doc._id } });
        await Fansub.findByIdAndUpdate({_id: doc.fansub}, { $pull: { projects: doc._id } });
    } catch(err) {
        console.log({err});
    }
});

module.exports = mongoose.model('Project', projectSchema, 'Projects');