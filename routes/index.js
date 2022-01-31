import { Router } from '@awaitjs/express';

const router = Router();

router.getAsync('/', async (req, res) => {
    res.status(200).json('Welcome to Aniverse API');
});

export default router;