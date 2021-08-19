import { Router } from 'express';
import verify from '../middlewares/user-parser.js';

const router = Router();

router.get('/', verify, async (req, res) => {
    res.json(req.user);
});

export default router;