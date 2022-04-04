import * as schemes from '@aniverse/utils/validations/index.js';
import { Router } from '@awaitjs/express';
import { hasFansubPermissions } from '../../middlewares/auth.js';
import validate from '../../middlewares/validation.js';
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
router.postAsync('/', hasFansubPermissions('members'), validate(schemes.usernameScheme), async (req, res) => {
    const user = await User.findOne({username: req.body.username});
    if(!user) {
        return res.status(403).send('Username Not Found');
    }

    const member = req.fansub.members.find(member => member.userId.equals(user._id));
    if(member) {
        return res.status(403).send('User is lready a member');
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
router.putAsync('/:userId', hasFansubPermissions('members'), validate(schemes.roleAndPermissionsUpdateScheme), async (req, res) => {
    if(req.fansub.owner.equals(req.params.userId) && !req.user._id.equals(req.params.userId)) {
        return res.status(401).send('Unauthorized');
    }

    const members = req.fansub.members.toObject();
    const memberIndex = members.findIndex(member => member.userId.equals(req.params.userId));
    if(( members[memberIndex].permissions.includes('members') && !members[memberIndex].userId.equals(req.user._id) ) && !req.fansub.owner.equals(req.user._id)) {
        return res.status(401).send('Unauthorized');
    }
    members[memberIndex].role = req.body.role;
    members[memberIndex].permissions = req.body.permissions;

    req.fansub.members = members;
    const fansub = await req.fansub.save();

    const user = await User.findById(req.params.userId);
    members[memberIndex].user = user;
    delete members[memberIndex].userId;
    
    res.send(members[memberIndex]);
});

//DELETE member (authorization checking inside instead of middleware...)
router.deleteAsync('/:userId', async (req, res) => {
    if(req.fansub.owner.equals(req.params.userId)) {
        return res.status(401).send('Unauthorized');
    }
    
    const member = req.fansub.members.find(member => member.userId.equals(req.user._id));
    if (!(member && (member.permissions.includes('members') || member.userId.equals(req.user._id) ||  member.userId.equals(req.fansub.owner)))) {
        return res.status(401).send('Unauthorized');
    }

    req.fansub.members = req.fansub.members.filter(member => !member.userId.equals(req.params.userId));
    await req.fansub.save();

    const user = await User.findById(req.params.userId);
    user.memberInFansubs = user.memberInFansubs.filter(fansub => !fansub._id.equals(req.fansub._id));
    await user.save();

    res.send(req.params.userId);
});

export default router;