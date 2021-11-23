import { Router } from '@awaitjs/express';
import User from '../../models/User.js';
import UnverifiedUser from '../../models/UnverifiedUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validate from '../../middlewares/validation.js';
import * as schemes from '@aniverse/utils/validations/index.js';
import nodemailer from'nodemailer';

import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const router = Router();

//Login
router.postAsync('/login', validate(schemes.loginScheme), async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    const unverifiedExist = await UnverifiedUser.findOne({email: req.body.email});

    if(user) {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            return res.status(400).send('Email or password is wrong');
        }
        //Create and assign a TOKEN
        const token = jwt.sign({id: user._id, username: user.username}, process.env.TOKEN_SECRET, {expiresIn: '7d'});
        return res.status(200).json({token, user});
    } else if(unverifiedExist) {
        const validPassword = await bcrypt.compare(req.body.password, unverifiedExist.password);
        if(!validPassword) {
            return res.status(400).send('Email or password is wrong');
        }
        return res.status(403).send("unverified");
    }

    res.status(400).send('Email or password is wrong');
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
    const token = jwt.sign({email: savedUser.email}, process.env.TOKEN_SECRET, {expiresIn: '7d'});

    const welcomeMail = {
        from: '"Aniverse - NoReply"',
        to: savedUser.email,
        subject: 'ברוכים הבאים לAniverse!',
        text: `שלום ${savedUser.username},
אנו שמחים על הרשמתך לאתרינו והצטרפותך לקהילה.

קישור לאימות משתמש:
${process.env.CLIENT_URL}/login?token=${token}
`
    };

    transporter.sendMail(welcomeMail, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            
        }
    });

    
    return res.status(200).json({token, user: savedUser});
});

//Verify
router.getAsync('/verify/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.TOKEN_SECRET);
        const userExist = await UnverifiedUser.findOneAndRemove({email: decoded.email});
        if(!userExist) {
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
    } catch(err) {
        console.log(err)
        return res.status(400).send('Wrong token!');
    }
});

//Resend token
router.postAsync('/verify/resend', async (req, res) => {
    const unverifiedUser = await UnverifiedUser.findOne({email: req.body.email});
    
    if(!unverifiedUser) {
        return res.status(400).send('Email not found');
    }

    const token = jwt.sign({email: unverifiedUser.email}, process.env.TOKEN_SECRET, {expiresIn: '7d'});

    const welcomeMail = {
        from: '"Aniverse - NoReply"',
        to: unverifiedUser.email,
        subject: 'ברוכים הבאים לAniverse!',
        text: `שלום ${unverifiedUser.username},
אנו שמחים על הרשמתך לאתרינו והצטרפותך לקהילה.

קישור לאימות משתמש:
${process.env.CLIENT_URL}/login?token=${token}
`
    };

    transporter.sendMail(welcomeMail, function(error, info) {
        if (error) {
            console.log(error);
            return res.status(500).send();
        } else {
            return res.status(200).send('Token is sent');
        }
    });
    

    res.status(200).send('Token is sent');
});

router.getAsync('/logout', (req, res) => {
    res.clearCookie('auth-token').status(204).redirect('/');
});


export default router;