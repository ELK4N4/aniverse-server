import { Router } from '@awaitjs/express';
import User from '../../models/User.js';

const router = Router();

//GET members
router.getAsync('/', async (req, res) => {
    const members = req.fansub.members.toObject();
    for (let i = 0; i < members.length; i++) {
        const user = await User.findById(members[i].userId);
        members[i].user = user;
        delete members[i].userId;
    }

    res.send(members);
});

//POST member
router.postAsync('/:username', async (req, res) => {
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
router.putAsync('/:userId', async (req, res) => {
    const memberIndex = req.fansub.members.findIndex(member => member.userId.equals(req.params.userId));
    req.fansub.members[memberIndex].role = req.body.role;
    req.fansub.members[memberIndex].permissions = req.body.permissions;
    await req.fansub.save();
    res.send(req.fansub.members[memberIndex]);
});

//DELETE member
router.deleteAsync('/:userId', async (req, res) => {
    req.fansub.members = req.fansub.members.filter(member => !member.userId.equals(req.params.userId));
    await req.fansub.save();

    const user = await User.findById(req.params.userId);
    user.memberInFansubs = user.memberInFansubs.filter(fansub => !fansub._id.equals(req.fansub._id));
    await user.save();

    res.send(req.params.userId);
});

export default router;