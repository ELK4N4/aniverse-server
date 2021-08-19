import { Router } from 'express';
import Fansub from '../models/Fansub.js';

const router = Router();

router.get('/', async (req, res) => {
    console.log(req.user)
    res.status(200).json(req.user);
});

router.get('/my-fansubs', async (req, res) => {
    const fansubs = await Fansub.find({ _id: { $in: req.user.memberInFansubs } });
    if(!fansubs) {
        return res.status(400).json({error: 'User doesnt member in a fansub'})
    }
    res.status(200).json(fansubs);
});

export default router;