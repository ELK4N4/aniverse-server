import Episode from '../../models/Episode.js';
import { Router } from '@awaitjs/express';

const router = Router();

//GET all anime episodes
router.getAsync('/', async (req, res) => {
    let filter = {anime: req.anime._id};
    if(req.query.fansubId) {
        filter.addedByFansub = req.query.fansubId;
    }

    let episodes = await Episode.find(filter).populate('addedByFansub', 'name');
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

    if(req.user) {
        await AnimeTracking.findOneAndUpdate({userId: req.user._id, animeId: req.anime._id}, {currentEpisode: episode.number}, {new: true});
    }
    res.status(200).send(episode);
});

import commentsRouter from './comments.js';
import AnimeTracking from '../../models/AnimeTracking.js';

router.useAsync('/:episodeId/comments/', async (req, res, next) => {
    const episode = await Episode.findById(req.params.episodeId).populate({
        path: 'comments',
        model: 'EpisodeComment',
        populate: { 
            path: 'addedByUser',
            model: 'User',
            select: 'username avatar',
        }

    });
    if(!episode) {
        return res.status(400).json({error: 'Fansub Not Exist'});
    }
    req.episode = episode;
    next();
}, commentsRouter);

export default router;
