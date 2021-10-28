import { Router } from '@awaitjs/express';
import User from '../models/User.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const users = await User.find({role: {$ne: null}});
    console.log(users)
    res.header('Content-Range', 'users 0-24/319');
    res.status(200).json(users);
});

router.getAsync('/:userId', async (req, res) => {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
});

router.postAsync('/:userName', async (req, res) => {
    const role = "מנהל";
    console.log(req.params.userName)
    const user = await User.findOneAndUpdate({username: req.params.userName}, {role}, {new: true});
    if(!user) {
        return res.status(400).send('User not exist');
    }
    res.status(200).json(user);
});

router.putAsync('/:userId', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true});
    res.status(200).json(user);
});

router.deleteAsync('/:userId', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.userId, {role: null, permissions: null}, {new: true});
    res.status(200).json(user);
});

export default router;