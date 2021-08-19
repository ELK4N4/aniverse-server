import { Router } from 'express';
import Episode from '../../models/Episode.js';
import verify from '../../middlewares/user-parser.js';

const router = Router();

//GET all episodes
router.get('/', async (req, res) => {
    const episodes = await Episode.find();
    res.json(episodes);
});

// GET episode
router.get('/:episodeId', async (req, res) => {
    const episode = await Episode.findById({_id: req.params.episodeId});
    if(!episode) {
        return res.status(403).json({error: "Episode Not Found"});
    }

    res.status(200).send(episode);
});

//POST new episodes
router.post('/', verify, async (req, res) => {
    // TODO add check if user member in fansubId...
    const episodeExist = await Episode.findOne({number: req.body.number, project: req.project._id, season: req.body.season});
    if(episodeExist) {
        return res.status(400).send('הפרק כבר קיים');
    }

    const episode = new Episode({
        anime: req.project.anime,
        project: req.project._id,
        name: req.body.name,
        number: req.body.number,
        link: req.body.link,
        image: req.body.image,
        season: req.body.season,
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

//UPDATE exist animes
router.put('/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;
    console.log(episodeId)

    const oldEpisode = await Episode.findById({ _id: episodeId });

    if(!oldEpisode) {
        return res.status(403).send("הפרק לא קיים");
    }
    

    if(oldEpisode.season !== req.body.season || oldEpisode.number !== req.body.number) {
        const dupCheck = await Episode.findOne({project: req.project._id, number: req.body.number , season: req.body.season });
        console.log(dupCheck)
        if(dupCheck) {
            return res.status(403).send("הפרק כבר קיים");
        }
    }

    const episodeFields = {oldEpisode, ...req.body};
    const updatedEpisode = await Episode.findOneAndUpdate({_id: episodeId}, episodeFields, {new: true});

    res.status(200).send(updatedEpisode);
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


// /*** SPECIFIC EPISODES ***/


// episodesRouter = require('./episodes');
// router.use('/:project/', (req, res, next) => {
//     const projectName = req.params.project.replace(/-/g," ");
//     req.project = projectName;
//     next();
// }, episodesRouter);


export default router;
