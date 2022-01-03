import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Ban from '../models/Ban.js';

const userParser = async (req,res,next) => {
    const token = req.headers.authorization?.split(' ')[1];
    req.user = null;
    if(!token) {
        return next();
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        try {
            const user = await User.findOne({_id: verified.id});
            req.user = user;
        } catch(err) {
            console.log(err);
            res.status(401).send('Invalid Token');
        }
        next();
    } catch(err) {
        res.status(401).send('Invalid Token');
    }
};

const hasPermissions = (...permissions) => (req, res, next) => {
    if (permissions.every(permission => req.user.permissions.includes(permission)) || req.user.owner) {
        next();
    } else {
        return res.status(401).send('Unauthorized');
    }
};

const hasFansubPermissions = (...permissions) => (req, res, next) => {
    const member = req.fansub.members.find(member => member.userId.equals(req.user._id));
    if (permissions.every(permission => member.permissions.includes(permission)) || member.owner) {
        next();
    } else {
        return res.status(401).send('Unauthorized');
    }
};

export { hasPermissions, hasFansubPermissions, userParser };