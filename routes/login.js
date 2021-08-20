import { Router } from '@awaitjs/express';
import verify from '../middlewares/user-parser.js';

const router = Router();

router.getAsync('/', verify, async (req, res) => {
    res.json(req.user);
});

export default router;