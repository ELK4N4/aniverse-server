import mongoose from 'mongoose';
import Project from './Project.js';

const animeSchema = new mongoose.Schema({
    name: {
        hebrew: {
            type: String,
        },
        english: {
            type: String,
        },
        japanese: {
            type: String,
        }
    },
    type: {
        type: String,
        default: 'series'
    },
    addedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    episodesNumber: {
        type: Number
    },
    genres: {
        type: [String]
    },
    summary: {
        type: String
    },
    image: {
        type: String,
        default: ''
    },
    projects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project'
    }]
}, 
{
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

animeSchema.method('getRating', async function (userId) {
    const score = await mongoose.model('Rating').aggregate([
        { $match: { animeId: mongoose.Types.ObjectId(this._id) } },
        { $group: {
            _id: "$animeId",
            avg: { $avg: "$score" },
        }},
    ]);

    const rating = {}

    if(score.length > 0) {
        rating.avg = score[0].avg;

        if(userId) {
            const userRating = await mongoose.model('Rating').findOne({animeId: this._id, userId });
            rating.userRating = userRating;
        }
    }
   
    return rating;
})

animeSchema.post('findOneAndDelete', async function(doc) {
    try {
        await Project.findOneAndDelete({anime: doc._id});
    } catch(err) {
        console.log({err});
    }
});

export default mongoose.model('Anime', animeSchema, 'Animes');