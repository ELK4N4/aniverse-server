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

export default router;