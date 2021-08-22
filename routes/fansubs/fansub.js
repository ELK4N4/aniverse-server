import { Router } from '@awaitjs/express';
import Fansub from '../../models/Fansub.js';
import User from '../../models/User.js';

const router = Router();

//GET fansub
router.getAsync('/', async (req, res) => {
    res.json(req.fansub);
});

//DELETE exist fansub
router.deleteAsync('/', async (req, res) => {
    const deletedFansub = await Fansub.findOneAndRemove({ _id: req.fansub._id });
    if (deletedFansub) {
        return res.status(203).send(deletedFansub);
    }

    console.log(deletedFansub);

    res.status(401).send('Fansub Not Found');
});


//UPDATE fansub
router.putAsync('/', async (req, res) => {
    const oldFansub = await Fansub.find({_id: req.fansub._id});

    if(!oldFansub) {
        return res.status(403).send('Fansub Not Found');
    }
    
    const fansubFields = {...oldFansub, ...req.body};
    const updatedFansub = await Fansub.findOneAndUpdate({_id: req.fansub._id}, fansubFields, {new: true});

    res.status(200).send(updatedFansub);
});

///MEMBERS///

//GET members
router.getAsync('/members', async (req, res) => {
    const members = JSON.parse(JSON.stringify(req.fansub.members));
    for (let i = 0; i < members.length; i++) {
        const user = await User.findById({_id: members[i].userId});
        members[i].user = user;
        delete members[i].userId;
    }

    res.send(members);
});

//POST member
router.postAsync('/members/:username', async (req, res) => {
    const user = await User.findOne({username: req.params.username});
    if(!user) {
        return res.status(403).send('Username Not Found');
    }

    const newMember = {
        userId: user._id,
        roles: ['member'],
        permissions: [
            'projects',
            'fansub',
            'episodes',
            'members',
        ]
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
router.putAsync('/members/:userId', async (req, res) => {
    const memberIndex = req.fansub.members.findIndex(member => member.userId.equals(req.params.userId));
    req.fansub.members[memberIndex].roles = req.body.roles;
    req.fansub.members[memberIndex].permissions = req.body.permissions;
    await req.fansub.save();
    res.send(req.fansub.members[memberIndex]);
});

//DELETE member
router.deleteAsync('/members/:userId', async (req, res) => {
    req.fansub.members = req.fansub.members.filter(member => !member.userId.equals(req.params.userId));
    await req.fansub.save();

    const user = await User.findById({_id: req.params.userId});
    user.memberInFansubs = user.memberInFansubs.filter(fansub => !fansub._id.equals(req.fansub._id));
    await user.save();

    res.send(req.params.userId);
});


/*** PROJECTS ***/
import projectsRouter from './projects.js';
router.useAsync('/projects/', async (req, res, next) => {
    next();
}, projectsRouter);


export default router;