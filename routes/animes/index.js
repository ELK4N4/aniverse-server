import { Router } from '@awaitjs/express';
import Anime from '../../models/Anime.js';
import Rating from '../../models/Rating.js';
import * as schemes from '@aniverse/utils/validations/index.js';
import validate from '../../middlewares/validation.js';
import mongoose from 'mongoose';

const router = Router();

/*** ALL PROJECTS ***/

//GET all animes
router.getAsync('/', async (req, res) => {
    let animes;
    const skip = +req.query.skip ?? 0;
    const limit = +req.query.limit ?? 50;
    if (req.query.search) {
        animes = await Anime.find({ 'name.hebrew' : new RegExp('^' + req.query.search + '$', 'i')}).sort({'createdAt': -1}).limit(limit).skip(skip);
    } else {
        animes = await Anime.find().sort({'createdAt': -1}).limit(limit).skip(skip);
    }
    const animesWithRating = JSON.parse(JSON.stringify(animes));
    for (let index = 0; index < animesWithRating.length; index++) {
        animesWithRating[index].rating = await animes[index].getRating();
    }
    res.json(animesWithRating);
});

// GET anime
router.getAsync('/:animeId', async (req, res) => {
    const anime = await Anime.findById({_id: req.params.animeId}).populate({
        path: 'projects',
        model: 'Project',
        select: ['fansub', 'episodes'],
        populate: [{
            path: 'fansub',
            model: 'Fansub',
            select: 'name followers',
        },
        {
            path: 'episodes',
            model: 'Episode',
            select: 'number',
        }]
    });

    
    if(!anime) {
        return res.status(403).json({error: 'Anime Not Found'});
    }

    const animeWithRecommended = anime.toJSON();
    animeWithRecommended.rating = await anime.getRating(req.user?._id);
    
    if(anime.projects.length > 1) {
        let episodesNumber = animeWithRecommended.projects.reduce(
            (previousValue, currentProject) =>
                Math.max(previousValue, Math.max.apply(Math, currentProject.episodes.map(function(o) { return o.number; }))
                ) 
            , 0);
        let recommended = {};
        recommended.episodes = [];
        for(let i = 0; i < episodesNumber; i++)
        {
            let episode;
            let followers = -1;
            for(var p = 0; p < animeWithRecommended.projects.length; p++)
            {
                const projectEpisode = animeWithRecommended.projects[p].episodes.filter((episode) => episode && episode.number == i + 1)[0];
                if(animeWithRecommended.projects[p].fansub.followers > followers && projectEpisode)
                {
                    followers = animeWithRecommended.projects[p].fansub.followers;
                    episode = projectEpisode;
                }
            }
            if(episode) {
                recommended.episodes.push(episode);
            }
        }


        recommended.fansub = {_id: 'recommended', name: 'מומלץ'};
        animeWithRecommended.projects.unshift(recommended);
    }

    res.status(203).json(animeWithRecommended);
});

//POST new animes
router.postAsync('/', hasPermissions('animes'), validate(schemes.animeScheme), async (req, res) => {
    const anime = new Anime({
        name: {
            hebrew: req.body.name.hebrew,
            english: req.body.name.english,
            japanese: req.body.name.japanese,
        },
        summary: req.body.summary,
        episodesNumber: req.body.episodesNumber,
        genres: req.body.genres,
        image: req.body.image,
        addedByUser: req.user._id
    });

    const animeExist = await Anime.findOne({ 'name.hebrew': anime.name.hebrew });

    if(animeExist) {
        return res.status(400).send('Anime already exist');
    }

    const savedAnime = await anime.save();
    res.status(201).json(savedAnime);
});

//DELETE exist animes
router.deleteAsync('/:animeId', hasPermissions('animes'), async (req, res) => {
    const animeId = req.params.animeId;
    const deletedAnime = await Anime.findByIdAndDelete(animeId);
    if (deletedAnime) {
        res.status(203).send(deletedAnime);
    }

    res.status(401).send('Anime Not Found');
});


//UPDATE animes
router.putAsync('/:animeId', hasPermissions('animes'), validate(schemes.animeScheme), async (req, res) => {
    const animeId = req.params.animeId;
    let updatedAnime = req.body;

    const anime = await Anime.findOneAndUpdate({_id: animeId}, updatedAnime, {new: true});

    if(!anime){
        return res.status(404).send('Anime Not Found');
    }

    res.status(200).send(anime);
});


//GET anime rating
router.getAsync('/:animeId/rating', async (req, res) => {
    const animeId = req.params.animeId;

    const anime = await Anime.findById(animeId);

    if(!anime){
        return res.status(404).send('Anime Not Found');
    }

    const score = await Rating.aggregate([
        { $match: { animeId: mongoose.Types.ObjectId(animeId) } },
        { $group: {
            _id: "$animeId",
            avg: { $avg: "$score" },
        }},
    ]);
    res.status(200).json({score: score[0].avg});
});


//POST animes rating
router.postAsync('/:animeId/rating', usersOnly, async (req, res) => {
    const animeId = req.params.animeId;
    const score = req.body.score;

    const anime = await Anime.findById(animeId);

    if(!anime){
        return res.status(404).send('Anime Not Found');
    }

    const userRating = await Rating.findOne({userId: req.user._id, animeId});

    if(userRating) {
        return res.status(404).send('Use PUT instead of get...');
    }

    const rating = new Rating({
        userId: req.user._id,
        animeId,
        score
    });

    await rating.save();
    const ratingScore = await anime.getRating(req.user._id);
    res.status(200).json(ratingScore);
});

//PUT animes rating
router.putAsync('/:animeId/rating/:ratingId', usersOnly, async (req, res) => {
    const animeId = req.params.animeId;
    const anime = await Anime.findById(animeId);

    if(!anime){
        return res.status(404).send('Anime Not Found');
    }

    const userRating = await Rating.findByIdAndUpdate(req.params.ratingId, {score: req.body.score}, {new: true});

    if(!userRating) {
        return res.status(404).send('Use POST instead of get...');
    }

    const score = await anime.getRating(req.user._id);
    res.status(200).json(score);
});

//DELETE animes rating
router.deleteAsync('/:animeId/rating/:ratingId', usersOnly, async (req, res) => {
    const animeId = req.params.animeId;
    const anime = await Anime.findById(animeId);

    if(!anime){
        return res.status(404).send('Anime Not Found');
    }

    const userRating = await Rating.findById(req.params.ratingId);
    if(!userRating) {
        return res.status(404).send('Rating not found');
    }

    if(!userRating.userId.equals(req.user._id)) {
        return res.status(404).send('Unauthorized');
    }
   
    await Rating.findByIdAndRemove(req.params.ratingId);
    const score = await anime.getRating();

    res.status(200).json(score);
});




/*** SPECIFIC EPISODES ***/

import episodesRouter from './episodes.js';
import { hasPermissions, usersOnly } from '../../middlewares/auth.js';
router.useAsync('/:animeId/episodes', async (req, res, next) => {
    const anime = await Anime.findById({_id: req.params.animeId});
    if(!anime) {
        return res.status(403).json({error: 'Anime Not Found'});
    }
    req.anime = anime;
    next();
}, episodesRouter);


export default router;
