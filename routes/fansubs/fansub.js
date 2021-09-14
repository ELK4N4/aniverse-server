import { Router } from '@awaitjs/express';
import Fansub from '../../models/Fansub.js';
import User from '../../models/User.js';

const router = Router();
// Will be prefixed with fansub id and fansub in request body
const fansubRouter = Router({mergeParams: true});



//GET fansub
fansubRouter.getAsync('', async (req, res) => {
    res.json(req.fansub);
});

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
        image: req.body.image,
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

//DELETE exist fansub
fansubRouter.deleteAsync('', async (req, res) => {
    const deletedFansub = await Fansub.findOneAndDelete({ _id: req.fansub._id });
    if (deletedFansub) {
        return res.status(203).send(deletedFansub);
    }

    console.log(deletedFansub);

    res.status(401).send('Fansub Not Found');
});


//UPDATE fansub
fansubRouter.putAsync('', async (req, res) => {
    const oldFansub = await Fansub.find({_id: req.fansub._id});

    if(!oldFansub) {
        return res.status(403).send('Fansub Not Found');
    }
    
    const fansubFields = {...oldFansub, ...req.body};
    const updatedFansub = await Fansub.findOneAndUpdate({_id: req.fansub._id}, fansubFields, {new: true});

    res.status(200).send(updatedFansub);
});

//GET members
fansubRouter.postAsync('/followers', async (req, res) => {
    if(req.user.followingFansubs.includes(req.fansub._id)){
        return res.status(401).send('You are already following');
    }
    req.user.followingFansubs.push(req.fansub._id);
    await req.user.save();
    
    req.fansub.followers++;
    await req.fansub.save();

    res.status(203).send('Following successfully');
});

/*** PROJECTS ***/
import projectsRouter from './projects.js';
fansubRouter.useAsync('/projects/', async (req, res, next) => {
    next();
}, projectsRouter);

/*** FOLLOWERS ***/
import followersRouter from './followers.js';
fansubRouter.useAsync('/followers/', async (req, res, next) => {
    next();
}, followersRouter);

/*** MEMBERS ***/
import membersRouter from './members.js';
fansubRouter.useAsync('/members/', async (req, res, next) => {
    next();
}, membersRouter);

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
        return res.status(400).json({error: 'Fansub Not Exist'});
    }
    req.fansub = fansub;
    next();
}, fansubRouter);


export default router;