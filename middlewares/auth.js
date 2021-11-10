import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    if (req.user.permissions.some(permission => permissions.includes(permission))) {
        next();
    } else {
        console.log(req.user.permissions)
        return res.status(401).send('Unauthorized');
    }
};

export { hasPermissions, userParser };