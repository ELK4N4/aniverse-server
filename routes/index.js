import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json('Welcome to Anime Prime API');
});

router.get('/home', (req, res) => {
    res.redirect('/');
});

export default router;