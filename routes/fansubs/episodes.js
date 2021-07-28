const express = require('express');
const router = express.Router();
const Episode = require('../../models/Episode');
const Fansub = require('../../models/Fansub');
const Project = require('../../models/Project');
const Anime = require('../../models/Anime');
const verify = require('../../middlewares/user-parser');


//GET all episodes
router.get('/', async (req, res) => {
    const episodes = await Episode.find();
    res.json(episodes);
});

// GET episode
router.get('/:episodeId', async (req, res) => {
    const epidose = await Episode.findById({_id: req.params.episodeId});
    if(!epidose) {
        return res.status(403).json({error: "Episode Not Found"});
    }

    res.status(200).send(epidose);
});

//POST new episodes
router.post('/', verify, async (req, res) => {
    // TODO add check if user member in fansubId...
    const episodeExist = await Episode.findOne({number: req.body.number, addedByFansub: req.body.fansub});
    if(episodeExist) {
        return res.status(400).send('Episode already exist');
    }

    const episode = new Episode({
        anime: req.project.anime,
        project: req.project._id,
        name: req.body.name,
        number: req.body.number,
        link: req.body.link,
        image: req.body.image,
        season: req.project.season,
        post: req.body.post,
        addedByUser: req.user._id,
        addedByFansub: req.fansub._id
    });

    try {
        const savedEpisode = await episode.save();
        res.status(201).json(savedEpisode);
    } catch(err) {
        res.status(400).send(err);
    }

});

//DELETE exist animes
router.delete('/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;
    const deletedEpisode = await Episode.findOneAndRemove({ _id: episodeId });

    if (deletedEpisode) {
        return res.status(203).send(deletedEpisode);
    }

    res.status(401).send("Episode Not Found");
});


//UPDATE animes
router.put('/:animeId', async (req, res) => {
    const animeId = req.params.animeId;
    let updatedAnime = req.body;

    const anime = await Anime.findOneAndUpdate({_id: animeId}, updatedAnime, {new: true});

    if(!anime){
        return res.status(404).send("Anime Not Found");
    }

    res.status(200).send(anime);
});



// /*** SPECIFIC EPISODES ***/


// episodesRouter = require('./episodes');
// router.use('/:project/', (req, res, next) => {
//     const projectName = req.params.project.replace(/-/g," ");
//     req.project = projectName;
//     next();
// }, episodesRouter);


module.exports = router;
