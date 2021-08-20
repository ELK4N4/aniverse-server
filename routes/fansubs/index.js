import { Router } from '@awaitjs/express';
import Fansub from '../../models/Fansub.js';
import verify from '../../middlewares/user-parser.js';

const router = Router();

//GET all fansubs
router.getAsync('/', async (req, res) => {
    const fansubs = await Fansub.find();
    res.json(fansubs);
});

//POST new fansub
router.postAsync('/', verify, async (req, res) => {
    const fansubExist = await Fansub.findOne({name: req.body.name});

    if(fansubExist) {
        return res.status(400).send('Fansub name already exist');
    }

    const fansub = new Fansub({
        name: req.body.name,
        image: req.body.image,
        createdByUser: req.user._id,
        members: [{
            userId: req.user._id,
            roles: ['admin'],
            permissions: [
                'projects',
                'fansub',
                'episodes',
                'members',
            ]
        }]
    });

    const savedFansub = await fansub.save();
    req.user.memberInFansubs.push(savedFansub._id);
    await req.user.save();

    res.status(201).json(savedFansub);

});



/*** PROJECTS ***/

import fansubRouter from './fansub.js';
router.useAsync('/:fansubId/', async (req, res, next) => {
    const fansub = await Fansub.findById({_id: req.params.fansubId}).populate({
        path: 'projects',
        model: 'Project',
        populate: {
          path: 'anime',
          model: 'Anime',
        },
    });
    if(!fansub) {
        return res.status(400).json({error: 'Fansub Not Exist'})
    }
    req.fansub = fansub;
    next();
}, fansubRouter);


export default router;
