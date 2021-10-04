import { Router } from '@awaitjs/express';
import bcrypt from 'bcryptjs';
import Fansub from '../../models/Fansub.js';
import User from '../../models/User.js';

const router = Router();

router.getAsync('/', async (req, res) => {
    res.status(200).json(req.user);
});

router.putAsync('/', async (req, res) => {
    if(req.body.password) {
        if(req.body.password.length === 0) {
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

router.getAsync('/my-fansubs', async (req, res) => {
    const fansubs = await Fansub.find({ _id: { $in: req.user.memberInFansubs } });

    if(!fansubs) {
        return res.status(400).json({error: 'User doesn\'t member in a fansub'});
    }
    res.status(200).json(fansubs);
});

export default router;