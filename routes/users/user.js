import * as schemes from '@aniverse/utils/validations/index.js';
import { Router } from '@awaitjs/express';
import bcrypt from 'bcryptjs';
import validate from '../../middlewares/validation.js';
import Fansub from '../../models/Fansub.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    res.status(200).json(req.user);
});

router.putAsync('/', validate(schemes.userUpdateScheme), async (req, res) => {
    if(req.body.password != null || req.body.password != undefined) {
        if(req.body.password.length == 0) {
            delete req.body.password;
        } else {
            //Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true});
    res.status(200).json(user);
});

router.getAsync('/notifications', async (req, res) => {
    const skip = +req.query.skip ?? 0;
    const limit = +req.query.limit ?? 50;
    const notifications = await Notification.find({userId: req.user._id}).sort({'createdAt': -1}).limit(limit).skip(skip);
    res.status(200).json(notifications);
});

router.putAsync('/notifications/:notificationId', async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.notificationId, {checked: true}, {new: true});
    res.status(200).json(notification);
});

router.deleteAsync('/notifications/:notificationId', async (req, res) => {
    const notification = await Notification.findByIdAndRemove(req.params.notificationId);
    res.status(200).json(notification);
});

router.getAsync('/my-fansubs', async (req, res) => {
    const fansubs = await Fansub.find({ _id: { $in: req.user.memberInFansubs } });

    if(!fansubs) {
        return res.status(400).json({error: 'User doesn\'t member in a fansub'});
    }
    res.status(200).json(fansubs);
});

export default router;