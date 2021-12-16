import { Router } from '@awaitjs/express';
import validate from '../../middlewares/validation.js';
import Fansub from '../../models/Fansub.js';
import fansubRouter from './fansub.js';
import Notification from '../../models/Notification.js';
import * as schemes from '@aniverse/utils/validations/index.js';

const router = Router();
// Will be prefixed with fansub id and fansub in request body


//GET all fansubs
router.getAsync('/', async (req, res) => {
    let fansubs;
    const skip = +req.query.skip ?? 0;
    const limit = +req.query.limit ?? 50;
    if (req.query.search) {
        fansubs = await Fansub.find({ 'name' : new RegExp('^' + req.query.search + '$', 'i'), confirmed: req.query.confirmed}).sort({'followers': -1}).limit(limit).skip(skip);
    } else {
        fansubs = await Fansub.find({confirmed: req.query.confirmed}).sort({'followers': -1}).limit(limit).skip(skip);
    }

    res.json(fansubs);
});

//POST new fansub
router.postAsync('/', validate(schemes.fansubScheme), async (req, res) => {
    const fansubExist = await Fansub.findOne({name: req.body.name});

    if(fansubExist) {
        return res.status(400).send('Fansub name already exist');
    }

    const fansub = new Fansub({
        name: req.body.name,
        avatar: req.body.avatar,
        banner: req.body.banner,
        website: req.body.website,
        description: req.body.description,
        createdByUser: req.user._id,
        owner: req.user._id,
        members: [{
            userId: req.user._id,
            role: 'בעלים',
            permissions: [
                'projects',
                'fansub',
                'members',
            ]
        }]
    });

    const savedFansub = await fansub.save();
    req.user.memberInFansubs.push(savedFansub._id);
    await req.user.save();

    res.status(201).json(savedFansub);
});

//POST confirm fansub
router.getAsync('/:fansubId/confirm/', async (req, res) => {
    const fansub = await Fansub.findById(req.params.fansubId);

    if(!fansub) {
        return res.status(400).send('Fansub is not exist');
    }

    fansub.confirmed = true;

    const savedFansub = await fansub.save();
    res.status(201).json(savedFansub);
});


router.useAsync('/:fansubId/', async (req, res, next) => {
    const fansub = await Fansub.findById(req.params.fansubId).populate({
        path: 'projects',
        model: 'Project',
        populate: {
            path: 'anime',
            model: 'Anime',
        },
    });
    if(!fansub) {
        return res.status(400).json({error: 'Fansub Not Exist'});
    }
    req.fansub = fansub;
    next();
}, fansubRouter);

export default router;