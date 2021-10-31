import { Router } from '@awaitjs/express';
import User from '../models/User.js';
import Ban from '../models/Ban.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const bans = await Ban.find().populate('user');
    res.header('Content-Range', 'users 0-24/319');
    res.status(200).json(bans);
});

router.getAsync('/:banId', async (req, res) => {
    const ban = await Ban.findById(req.params.banId).populate("user");
    res.status(200).json(ban);
});

router.postAsync('/:username', async (req, res) => {
    const userExist = await User.findOne({username: req.params.username});
    if(!userExist) {
        return res.status(400).send('User not exist');
    }
    const banExist = await Ban.findOneAndUpdate({user: userExist._id});
    if(banExist) {
        return res.status(400).send('Ban is already exist');
    }
    const ban = new Ban({
        user: userExist._id,
        expired: req.body.expired,
        reason: req.body.reason,
    });
    const savedBan = await ban.save();
    savedBan.user = userExist;
    res.status(200).json(savedBan);
});

router.putAsync('/:banId', async (req, res) => {
    const ban = await Ban.findByIdAndUpdate(req.params.banId, req.body, {new: true}).populate("user");
    res.status(200).json(ban);
});

router.deleteAsync('/:banId', async (req, res) => {
    const ban = await Ban.findByIdAndRemove(req.params.banId);
    res.status(200).json(ban);
});

export default router;