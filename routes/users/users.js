import { Router } from '@awaitjs/express';
import User from '../../models/User.js';
import AnimeTracking from '../../models/AnimeTracking.js';
import Anime from '../../models/Anime.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const users = await User.find().lean();
    res.status(200).json(users);
});

router.getAsync('/:userId', async (req, res) => {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
});

router.getAsync('/:userId/tracking/animes/:status', async (req, res) => {
    const user = await User.findById(req.params.userId);
    if(!user) {
        return res.status(404).send('User Not Found');
    }
    const skip = +req.query.skip ?? 0;
    const limit = +req.query.limit ?? 50;
    let animeTracking = [];
    if(req.query.search.length > 0) {
        const anime = await Anime.findOne({ 'name.hebrew': req.query.search });
        if(anime) {
            animeTracking[0] = await AnimeTracking.findOne({animeId: anime._id, userId: req.params.userId, status: req.params.status}).populate('animeId').limit(limit).skip(skip);
        }
    } else {
        animeTracking = await AnimeTracking.find({userId: req.params.userId, status: req.params.status}).populate('animeId').limit(limit).skip(skip);
    }

    const animesWithRating = JSON.parse(JSON.stringify(animeTracking));
    for (let index = 0; index < animesWithRating.length; index++) {
        animesWithRating[index].animeId.rating = await animeTracking[index].animeId.getRating();
    }
    res.status(200).json(animesWithRating);
});

export default router;