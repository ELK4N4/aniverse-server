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

///MEMBERS///

//GET members
fansubRouter.getAsync('/members', async (req, res) => {
    const members = req.fansub.members.toObject();
    for (let i = 0; i < members.length; i++) {
        const user = await User.findById({_id: members[i].userId});
        members[i].user = user;
        delete members[i].userId;
    }

    res.send(members);
});

//POST member
fansubRouter.postAsync('/members/:username', async (req, res) => {
    const user = await User.findOne({username: req.params.username});
    if(!user) {
        return res.status(403).send('Username Not Found');
    }

    const newMember = {
        userId: user._id,
        role: 'חבר צוות',
        permissions: []
    };

    req.fansub.members.push(newMember);
    user.memberInFansubs.push(req.fansub._id);
    await req.fansub.save();
    await user.save();

    delete newMember.userId;
    newMember.user = user;
    res.send(newMember);
});

//UPDATE member
fansubRouter.putAsync('/members/:userId', async (req, res) => {
    const memberIndex = req.fansub.members.findIndex(member => member.userId.equals(req.params.userId));
    req.fansub.members[memberIndex].role = req.body.role;
    req.fansub.members[memberIndex].permissions = req.body.permissions;
    await req.fansub.save();
    res.send(req.fansub.members[memberIndex]);
});

//DELETE member
fansubRouter.deleteAsync('/members/:userId', async (req, res) => {
    req.fansub.members = req.fansub.members.filter(member => !member.userId.equals(req.params.userId));
    await req.fansub.save();

    const user = await User.findById({_id: req.params.userId});
    user.memberInFansubs = user.memberInFansubs.filter(fansub => !fansub._id.equals(req.fansub._id));
    await user.save();

    res.send(req.params.userId);
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