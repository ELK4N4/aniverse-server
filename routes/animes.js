import { Router } from '@awaitjs/express';
import Anime from '../models/Anime.js';

const router = Router();

/*** ALL PROJECTS ***/

//GET all animes
router.getAsync('/', async (req, res) => {
    let animes;
    if (req.query.search) {
        animes = await Anime.find({ 'name.hebrew' : new RegExp('^' + req.query.search + '$', 'i')});
    } else {
        animes = await Anime.find();
    }
    res.json(animes);
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

    if(anime.projects.length > 1) {
        let episodesNumber = animeWithRecommended.projects.reduce(
            (previousValue, currentProject) =>
                Math.max(previousValue, currentProject.episodes.length) 
            , 0);
        let recommended = {};
        recommended.episodes = [];
        for(var i = 0; i < episodesNumber; i++)
        {
            let episode;
            let followers = -1;
            for(var p = 0; p < animeWithRecommended.projects.length; p++)
            {
                if(animeWithRecommended.projects[p].fansub.followers > followers && animeWithRecommended.projects[p].episodes[i])
                {
                    followers = animeWithRecommended.projects[p].fansub.followers;
                    episode = animeWithRecommended.projects[p].episodes[i];
                }
            }
            recommended.episodes.push(episode);
        }
        recommended.fansub = {_id: 'recommended', name: 'מומלץ'};
        animeWithRecommended.projects.unshift(recommended);
    }

    res.status(203).json(animeWithRecommended);
});

//POST new animes
router.postAsync('/', async (req, res) => {
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
router.deleteAsync('/:animeId', async (req, res) => {
    const animeId = req.params.animeId;
    const deletedAnime = await Anime.findOneAndDelete({ _id: animeId });
    if (deletedAnime) {
        res.status(203).send(deletedAnime);
    }

    res.status(401).send('Anime Not Found');
});


//UPDATE animes
router.putAsync('/:animeId', async (req, res) => {
    const animeId = req.params.animeId;
    let updatedAnime = req.body;

    const anime = await Anime.findOneAndUpdate({_id: animeId}, updatedAnime, {new: true});

    if(!anime){
        return res.status(404).send('Anime Not Found');
    }

    res.status(200).send(anime);
});



/*** SPECIFIC EPISODES ***/

import episodesRouter from './episodes/episodes.js';
router.useAsync('/:animeId/episodes', async (req, res, next) => {
    const anime = await Anime.findById({_id: req.params.animeId});
    if(!anime) {
        return res.status(403).json({error: 'Anime Not Found'});
    }
    req.anime = anime;
    next();
}, episodesRouter);


export default router;
