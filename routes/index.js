import { Router } from '@awaitjs/express';

const router = Router();

router.getAsync('/', (req, res) => {
    res.status(200).json('Welcome to Anime Prime API');
});

router.getAsync('/home', (req, res) => {
    res.redirect('/');
});

export default router;