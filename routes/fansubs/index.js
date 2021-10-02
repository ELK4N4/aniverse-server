import { Router } from '@awaitjs/express';
import Fansub from '../../models/Fansub.js';
import fansubRouter from './fansub.js';
const router = Router();
// Will be prefixed with fansub id and fansub in request body


//GET all fansubs
router.getAsync('/', async (req, res) => {
    let fansubs;
    if (req.query.search) {
        fansubs = await Fansub.find({ 'name' : new RegExp('^' + req.query.search + '$', 'i')});
    } else {
        fansubs = await Fansub.find();
    }
    res.json(fansubs);
});

//POST new fansub
router.postAsync('/', async (req, res) => {
    const fansubExist = await Fansub.findOne({name: req.body.name});

    if(fansubExist) {
        return res.status(400).send('Fansub name already exist');
    }

    const fansub = new Fansub({
        name: req.body.name,
        avatar: req.body.avatar,
        createdByUser: req.user._id,
        members: [{
            userId: req.user._id,
            role: 'מנהל',
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