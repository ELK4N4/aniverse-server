const jwt = require('jsonwebtoken');
const User = require('../models/User');
const isAdmin = require('../routes/auth/isAdmin');
const isOwner = require('../routes/auth/isOwner');

module.exports = async function (req,res,next) {
    const token = req.headers.authorization?.split(" ")[1];
    const guestUser = {
        username: "אורח",
        verified: false,
        role: 'guest'
    };

    if(!token) {
        req.user = guestUser;
        return next();
        //return res.status(401).send('Access Denied');
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        try {
            user = await User.findOne({_id: verified.id});
            req.user = user;
            req.user.verified = true;
        } catch(err) {
            console.log(err);
            req.user = guestUser;
        }
        next();
    } catch(err) {
        res.status(401).send('Invalid Token');
    }
}