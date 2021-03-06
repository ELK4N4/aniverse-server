import { Router } from '@awaitjs/express';
import validate from '../../middlewares/validation.js';
import Fansub from '../../models/Fansub.js';
import * as schemes from '@aniverse/utils/validations/index.js';

const router = Router({mergeParams: true});

//GET fansub
router.getAsync('', async (req, res) => {
    res.json(req.fansub);
});

//DELETE exist fansub
router.deleteAsync('', hasFansubPermissions('owner'), async (req, res) => {
    const deletedFansub = await Fansub.findByIdAndDelete(req.fansub._id);
    if (deletedFansub) {
        return res.status(203).send(deletedFansub);
    }

    res.status(401).send('Fansub Not Found');
});


//UPDATE fansub
router.putAsync('', hasFansubPermissions('fansub'), validate(schemes.fansubScheme), async (req, res) => {
    const oldFansub = await Fansub.findById(req.fansub._id);

    if(!oldFansub) {
        return res.status(403).send('Fansub Not Found');
    }
    
    const fansubFields = {oldFansub, ...req.body};
    const updatedFansub = await Fansub.findByIdAndUpdate(req.fansub._id, fansubFields, {new: true});

    res.status(200).send(updatedFansub);
});

/*** PROJECTS ***/
import projectsRouter from './projects.js';
router.useAsync('/projects/', async (req, res, next) => {
    next();
}, projectsRouter);

/*** FOLLOWERS ***/
import followersRouter from './followers.js';
router.useAsync('/followers/', async (req, res, next) => {
    next();
}, followersRouter);

/*** MEMBERS ***/
import membersRouter from './members.js';
import { hasFansubPermissions } from '../../middlewares/auth.js';
router.useAsync('/members/', async (req, res, next) => {
    next();
}, membersRouter);

export default router;