import { Router } from '@awaitjs/express';
import getData from '../data';

const router = Router();

router.getAsync('/', async (req, res) => {
    const data = await getData('register', 'הירשם', req.user);
    res.render('register.ejs', {data});
});

export default router;