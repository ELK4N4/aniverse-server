import * as schemes from '@aniverse/utils/validations/index.js';
import { Router } from '@awaitjs/express';
import { hasFansubPermissions } from '../../middlewares/auth.js';
import validate from '../../middlewares/validation.js';
import Episode from '../../models/Episode.js';

const router = Router();

//GET all episodes
router.getAsync('/', async (req, res) => {
    const episodes = await Episode.find();
    res.json(episodes);
});

// GET episode
router.getAsync('/:episodeId', async (req, res) => {
    const episode = await Episode.findById(req.params.episodeId);
    if(!episode) {
        return res.status(403).json({error: 'Episode Not Found'});
    }

    res.status(200).send(episode);
});

//POST new episodes
router.postAsync('/', hasFansubPermissions('projects'), validate(schemes.episodeScheme), async (req, res) => {
    // TODO add check if user member in fansubId...
    const episodeExist = await Episode.findOne({number: req.body.number, project: req.project._id});
    if(episodeExist) {
        return res.status(400).send('הפרק כבר קיים');
    }

    const episode = new Episode({
        anime: req.project.anime,
        project: req.project._id,
        name: req.body.name,
        number: req.body.number,
        link: req.body.link,
        post: req.body.post,
        addedByUser: req.user._id,
        addedByFansub: req.fansub._id
    });

    const savedEpisode = await episode.save();
    res.status(201).json(savedEpisode);

});

//UPDATE exist animes
router.putAsync('/:episodeId', hasFansubPermissions('projects'), validate(schemes.episodeScheme), async (req, res) => {
    const episodeId = req.params.episodeId;

    const oldEpisode = await Episode.findById(episodeId);

    if(!oldEpisode) {
        return res.status(403).send('הפרק לא קיים');
    }
    
    const dupCheck = await Episode.findOne({number: req.body.number, project: req.project._id});
    if(dupCheck) {
        return res.status(403).send('הפרק כבר קיים');
    }

    const episodeFields = {oldEpisode, ...req.body};
    const updatedEpisode = await Episode.findByIdAndUpdate(episodeId, episodeFields, {new: true});
    res.status(200).send(updatedEpisode);
});

//DELETE exist animes
router.deleteAsync('/:episodeId', hasFansubPermissions('projects'), async (req, res) => {
    const episodeId = req.params.episodeId;
    const deletedEpisode = await Episode.findOneAndDelete({ _id: episodeId });

    if (deletedEpisode) {
        return res.status(203).send(deletedEpisode);
    }

    res.status(401).send('Episode Not Found');
});


// /*** SPECIFIC EPISODES ***/


// episodesRouter = require('./episodes');
// router.use('/:project/', (req, res, next) => {
//     const projectName = req.params.project.replace(/-/g," ");
//     req.project = projectName;
//     next();
// }, episodesRouter);


export default router;
