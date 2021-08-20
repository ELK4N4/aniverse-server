import { Router } from '@awaitjs/express';
import Fansub from '../models/Fansub.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    console.log(req.user)
    res.status(200).json(req.user);
});

router.getAsync('/my-fansubs', async (req, res) => {
    const fansubs = await Fansub.find({ _id: { $in: req.user.memberInFansubs } });
    if(!fansubs) {
        return res.status(400).json({error: 'User doesn\'t member in a fansub'})
    }
    res.status(200).json(fansubs);
});

export default router;