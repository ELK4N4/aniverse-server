import { Router } from 'express';
import getData from '../data';

const router = Router();

router.get('/', async (req, res) => {
    const data = await getData('register', 'הירשם', req.user);
    res.render('register.ejs', {data});
});

export default router;