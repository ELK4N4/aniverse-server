import { Router } from '@awaitjs/express';
import User from '../../models/User.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const users = await User.find().lean();
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

router.deleteAsync('/:userId', async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.userId);
    res.status(200).json(user);
});

export default router;