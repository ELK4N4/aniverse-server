import { Router } from '@awaitjs/express';
import User from '../../models/User.js';
import UnverifiedUser from '../../models/UnverifiedUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validate from '../../middlewares/validation.js';
import * as schemes from '@aniverse/utils/validations/index.js';

const router = Router();

//Login
router.postAsync('/login', validate(schemes.loginScheme), async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    //checking if the user exist
    if(!user) {
        return res.status(400).send('Email or password is wrong');
    }

    //checking if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if(!validPassword) {
        return res.status(400).send('Email or password is wrong');
    }

    //Create and assign a TOKEN
    const token = jwt.sign({id: user._id, username: user.username}, process.env.TOKEN_SECRET, {expiresIn: '7d'});
    
    res.status(200).json({token, user});
});

//Register
router.postAsync('/register',validate(schemes.registerScheme), async (req, res) => {
    const emailExist = await User.findOne({email: req.body.email});
    const unverifiedEmailExist = await UnverifiedUser.findOne({email: req.body.email});

    if(emailExist || unverifiedEmailExist) {
        return res.status(400).send('Email already exist');
    }

    let regexName =  `^${req.body.username}$`;
    const usernameExist = await User.findOne( {username: { $regex: regexName, $options:'i' } }); //Check if the username is exist with ignoring case sensitive
    const unverifiedUsernameExist = await UnverifiedUser.findOne( {username: { $regex: regexName, $options:'i' } });

    if(usernameExist || unverifiedUsernameExist) {
        return res.status(400).send('Username already exist');
    }

    //Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    const user = new UnverifiedUser({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });
    const savedUser = await user.save();
    //Create and assign a TOKEN
    const token = jwt.sign({id: user._id, username: user.username}, process.env.TOKEN_SECRET, {expiresIn: '7d'});
    return res.status(200).json({token, user: savedUser});

});

//Register
router.getAsync('/verify/:token', async (req, res) => {

    try {
        const decoded = jwt.verify(process.env.TOKEN_SECRET, req.params.token);
        const userExist = await UnverifiedUser.findOne({email: decoded.email});
        if(!userExist) {
            return res.status(400).send('Wrong token!');
        }
    } catch(err) {
        return res.status(400).send('Wrong token!');
    }

    const user = new User({
        username: userExist.username,
        email: userExist.email,
        password: userExist.password
    });
    
    const savedUser = await user.save();
    //Create and assign a TOKEN
    const token = jwt.sign({id: user._id, username: user.username}, process.env.TOKEN_SECRET, {expiresIn: '7d'});
    return res.status(200).json({token, user: savedUser});

});

router.getAsync('/logout', (req, res) => {
    res.clearCookie('auth-token').status(204).redirect('/');
});


export default router;