import Episode from '../../models/Episode.js';
import EpisodeComment from '../../models/EpisodeComment.js';
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
    req.episodeJSON = JSON.parse(JSON.stringify(episode));

    for(let i=0; i < episode.comments.length; i++) {
        if(episode.comments[i].replyTo) {
            const replyTo = await EpisodeComment.findById(episode.comments[i].replyTo).populate({ 
                path: 'addedByUser',
                model: 'User',
                select: 'username avatar',
            });
            episode.comments[i].replyTo = replyTo;
        }
    }

    req.episode = episode;
    next();
}, commentsRouter);

export default router;
