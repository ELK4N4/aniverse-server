import { Router } from '@awaitjs/express';
import User from '../../models/User.js';
import Ban from '../../models/Ban.js';
import UnverifiedUser from '../../models/UnverifiedUser.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validate from '../../middlewares/validation.js';
import * as schemes from '@aniverse/utils/validations/index.js';
import nodemailer from'nodemailer';

import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
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

    if(unverifiedExist) {
        const validPassword = await bcrypt.compare(req.body.password, unverifiedExist.password);
        if(!validPassword) {
            return res.status(400).send('Email or password is wrong');
        }
        return res.status(403).send("unverified");
    } else if(user) {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            return res.status(400).send('Email or password is wrong');
        }
        const ban = await Ban.findOne({user: user._id});
        if(ban && new Date().getTime() - ban.expire.getTime() < 0) {
            if(new Date().getTime() - ban.expire.getTime() < 0) {
                return res.status(403).send(`עד לתאריך: ${ban.expire.toLocaleDateString('he-IL')}
סיבה:
${ban.reason}`);
            } else {
                await Ban.findByIdAndRemove(ban._id);
            }
        }
        //Create and assign a TOKEN
        const token = jwt.sign({id: user._id, username: user.username}, process.env.TOKEN_SECRET, {expiresIn: '7d'});
        return res.status(200).json({token, user});
    }

    res.status(400).send('Email or password is wrong');
});

//Register
router.postAsync('/register',validate(schemes.registerScheme), async (req, res) => {
    const emailExist = await User.findOne({email: req.body.email});
    const unverifiedEmailExist = await UnverifiedUser.findOne({email: req.body.email});

    if(emailExist || unverifiedEmailExist) {
        return res.status(400).send('Email already exists');
    }

    let regexName =  `^${req.body.username}$`;
    const usernameExist = await User.findOne( {username: { $regex: regexName, $options:'i' } }); //Check if the username is exist with ignoring case sensitive
    const unverifiedUsernameExist = await UnverifiedUser.findOne( {username: { $regex: regexName, $options:'i' } });

    if(usernameExist || unverifiedUsernameExist) {
        return res.status(400).send('Username already exists');
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
    const token = jwt.sign({email: savedUser.email}, process.env.TOKEN_SECRET, {expiresIn: '1d'});

    const welcomeMail = {
        from: process.env.EMAIL_USERNAME,
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

//Forgot password
router.postAsync('/forgot-password', validate(schemes.forgotPasswordScheme), async (req, res) => {
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return res.status(400).send('User is not exist');
    }

    //Create and assign a TOKEN
    const token = jwt.sign({_id: user._id, email: user.email}, process.env.TOKEN_SECRET, {expiresIn: '1d'});

    const welcomeMail = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'איפוס סיסמא - Aniverse',
        text: `שלום ${user.username},

קישור לאיפוס סיסמא:
${process.env.CLIENT_URL}/reset-password?token=${token}
`
    };

    transporter.sendMail(welcomeMail, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            
        }
    });

    
    return res.status(200).send("נשלח קישור איפוס סיסמא למייל");
});

//Reset password
router.postAsync('/reset-password/:token', validate(schemes.resetPasswordScheme), async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.TOKEN_SECRET);
        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = await User.findByIdAndUpdate(decoded._id, {password: hashedPassword}, {new: true});
        if(!user) {
            return res.status(400).send('Wrong token!');
        }

        return res.status(200).send("סיסמא אופסה בהצלחה!");
    } catch(err) {
        console.log(err)
        return res.status(400).send('Wrong token!');
    }
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
        from: process.env.EMAIL_USERNAME,
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


export default router;