import Episode from '../../models/Episode.js';
import Project from '../../models/Project.js';
import Anime from '../../models/Anime.js';
import { Router } from '@awaitjs/express';

const router = Router();

//GET all anime episodes
router.getAsync('/', async (req, res) => {
    let filter = {anime: req.anime._id};
    if(req.query.fansubId) {
        filter.addedByFansub = req.query.fansubId;
    }

    let episodes = await Episode.find(filter).populate('addedByFansub', 'name');
    
    if(!req.query.recommended && !req.query.fansubId != !req.query.recommended)
    {
        // TODO organize by followers numbers.
    }

    res.json(episodes);
});

// GET episode
router.getAsync('/:episodeId', async (req, res) => {
    const episode = await Episode.findById(req.params.episodeId).populate({
        path: 'addedByFansub',
        model: 'Fansub',
        select: 'name',
    });
    if(!episode) {
        return res.status(403).json({error: 'Episode Not Found'});
    }

    episode.views++;
    await episode.save();

    res.status(200).send(episode);
});

//POST new episodes
router.postAsync('/', async (req, res) => {
    // TODO add check if user member in fansubId...
    const episodeExist = await Episode.findOne({number: req.body.number, addedByFansub: req.body.addedByFansub});

    if(episodeExist) {
        return res.status(400).send('Episode already exist');
    }

    const episode = new Episode({
        anime: req.anime._id,
        name: req.body.name,
        number: req.body.number,
        link: req.body.link,
        post: req.body.post,
        addedByUser: req.user._id,
        addedByFansub: req.body.addedByFansub
    });

    const savedEpisode = await episode.save();

    const anime = await Anime.findById(req.anime._id);
    anime.episodes.push(savedEpisode._id);
    await Anime.findByIdAndUpdate(req.anime._id, anime);

    const project = await Project.findOne(req.anime._id);
    project.episodes.push(savedEpisode._id);
    await Project.findOneAndUpdate(req.anime._id, project);
        
    res.status(201).json(savedEpisode);

});

//DELETE exist episode
router.deleteAsync('/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;

    const deletedEpisode = await Episode.findOneAndDelete({ _id: episodeId });

    if (deletedEpisode) {
        const anime = await Anime.findById(req.anime._id);
        anime.episodes = anime.episodes.filter(episode => episode._id.toString() !== deletedEpisode._id.toString());
        await Anime.findByIdAndUpdate(req.anime._id, anime);

        const project = await Project.findOne({anime: req.anime._id});
        project.episodes = project.episodes.filter(episode => episode._id.toString() !== deletedEpisode._id.toString());
        await Project.findOneAndUpdate({anime: req.anime._id}, project);
        
        return res.status(203).send(deletedEpisode);
    }

    res.status(401).send('Episode Not Found');
});

import commentsRouter from './comments.js';

router.useAsync('/:episodeId/comments/', async (req, res, next) => {
    const episode = await Episode.findById(req.params.episodeId).populate({
        path: 'comments',
        model: 'EpisodeComment',
        populate: { 
            path: 'addedByUser',
            model: 'User',
            select: 'username profileImage',
        }

    });
    if(!episode) {
        return res.status(400).json({error: 'Fansub Not Exist'});
    }
    req.episode = episode;
    next();
}, commentsRouter);

export default router;
