import * as schemes from '@aniverse/utils/validations/index.js';
import { Router } from '@awaitjs/express';
import { hasPermissions } from '../middlewares/auth.js';
import validate from '../middlewares/validation.js';
import User from '../models/User.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    const skip = +req.query.skip ?? 0;
    const limit = +req.query.limit ?? 50;
    let admins;

    if (req.query.search) {
        admins = await User.find({role: {$ne: null}, 'username' : new RegExp('^' + req.query.search + '$', 'i')}).sort({'createdAt': 1}).limit(limit).skip(skip);
    } else {
        admins = await User.find({role: {$ne: null}}).sort({'createdAt': 1}).limit(limit).skip(skip);
    }

    res.status(200).json(admins);
});

router.getAsync('/:userId', async (req, res) => {
    const admin = await User.findById(req.params.userId);
    res.status(200).json(admin);
});

router.postAsync('/', hasPermissions('admins'), validate(schemes.usernameScheme), async (req, res) => {
    const role = "מנהל";
    const userExist = await User.findOne({username: req.body.username});
    if(!userExist) {
        return res.status(400).send('User not exist');
    } else if(userExist.role != null) {
        return res.status(400).send('User already an admin');
    }
    const admin = await User.findOneAndUpdate({username: req.body.username}, {role}, {new: true});
    res.status(200).json(admin);
});

router.putAsync('/:userId', hasPermissions('admins'), validate(schemes.roleAndPermissionsUpdateScheme), async (req, res) => {
    const admin = await User.findById(req.params.userId);
    console.log()
    if( (admin.permissions.includes('admins') && !admin._id.equals(req.user._id) && !req.user.owner) || (admin.owner && !admin._id.equals(req.user._id))) {
        return res.status(401).send('Unauthorized');
    }
    
    const updatedAdmin = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true});
    res.status(200).json(updatedAdmin);
});

router.deleteAsync('/:userId', hasPermissions('admins'), async (req, res) => {
    const admin = await User.findByIdAndUpdate(req.params.userId, {role: null, permissions: []}, {new: true});
    res.status(200).json(admin);
});

export default router;