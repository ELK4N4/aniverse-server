const express = require('express');
const router = express.Router();
const Anime = require('../models/Anime');

/*** ALL PROJECTS ***/

//GET all animes
router.get('/', async (req, res) => {
    let animes;
    if (req.query.search) {
        animes = await Anime.find({ 'name.hebrew' : new RegExp('^' + req.query.search + '$', "i")});
    } else {
        animes = await Anime.find();
    }
    res.json(animes);
});

// GET anime
router.get('/:animeId', async (req, res) => {
    const anime = await Anime.findById({_id: req.params.animeId});
    if(!anime) {
        return res.status(403).json({error: "Anime Not Found"});
    }
    res.json(anime);
});

//POST new animes
router.post('/', async (req, res) => {
    const anime = new Anime({
        name: {
            hebrew: req.body.hebrewName,
            english: req.body.englishName,
            japanese: req.body.japaneseName,
        },
        summary: req.body.summary,
        episodesNumber: req.body.episodesNumber,
        seasons: req.body.seasons,
        genre: req.body.genre,
        image: req.body.image,
        addedByUser: req.user._id
    });

    const animeExist = await Anime.findOne({ 'name.hebrew': anime.name.hebrew });

    if(animeExist) {
        return res.status(400).send('Anime already exist');
    }

    try {
        const savedAnime = await anime.save();
        res.status(201).json(savedAnime);
    } catch(err) {
        res.status(400).send(err);
    }

});

//DELETE exist animes
router.delete('/:animeId', async (req, res) => {
    const animeId = req.params.animeId;
    const deletedAnime = await Anime.findOneAndRemove({ _id: animeId });
    if (deletedAnime) {
        res.status(203).send(deletedAnime);
    }

    res.status(401).send("Anime Not Found");
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



/*** SPECIFIC EPISODES ***/

episodesRouter = require('./episodes/episodes');
router.use('/:animeId/episodes', async (req, res, next) => {
    const anime = await Anime.findById({_id: req.params.animeId});
    if(!anime) {
        return res.status(403).json({error: "Anime Not Found"});
    }
    req.anime = anime;
    next();
}, episodesRouter);


module.exports = router;
