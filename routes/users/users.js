import { Router } from '@awaitjs/express';
import User from '../../models/User.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const users = await User.find().lean();
    console.log(users)
    res.header('Content-Range', 'users 0-24/319');
    res.status(200).json(users);
});

router.getAsync('/:userId', async (req, res) => {
    const user = await User.findById(req.params.userId);
    res.status(200).json(user);
});

router.putAsync('/:userId', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true});
    res.status(200).json(user);
});

export default router;