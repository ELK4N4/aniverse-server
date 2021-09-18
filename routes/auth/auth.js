import { Router } from '@awaitjs/express';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

//Login
router.postAsync('/login', async (req, res) => {
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
router.postAsync('/register', async (req, res) => {
    const emailExist = await User.findOne({email: req.body.email});

    if(emailExist) {
        return res.status(400).send('Email already exist');
    }

    let regexName =  `^${req.body.username}$`;
    const usernameExist = await User.findOne( {username: { $regex: regexName, $options:'i' } }); //Check if the username is exist with ignoring case sensitive

    if(usernameExist) {
        return res.status(400).send('Username already exist');
    }

    //Hash Password
    const hashedPassword = await bcrypt.hash(req.body.password);
    
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
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