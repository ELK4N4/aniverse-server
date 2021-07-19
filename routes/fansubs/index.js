const express = require('express');
const router = express.Router();
const Fansub = require('../../models/Fansub');
const User = require('../../models/User');

const verify = require('../../middlewares/user-parser');


//GET all fansubs
router.get('/', async (req, res) => {
    const fansubs = await Fansub.find();
    res.json(fansubs);
});

//POST new fansub
router.post('/', verify, async (req, res) => {
    const fansubExist = await Fansub.findOne({name: req.body.name});

    if(fansubExist) {
        return res.status(400).send('Fansub name already exist');
    }

    const fansub = new Fansub({
        name: req.body.name,
        image: req.body.image,
        createdByUser: req.user._id,
        members: [{
            userId: req.user._id,
            roles: ['member', 'admin'],
            permissions: [
                'add-project',
                'delete-project',
                'update-project',
                'add-episode',
                'delete-episode',
                'update-episode',
                'add-members',
                'remove-members',
                'edit-roles',
                'edit-fansub-name',
                'edit-fansub-image',
                'delete-fansub'
            ]
        }]
    });

    try {
        const savedFansub = await fansub.save();

        // const user = await User.findById({_id: req.user._id});
        // user.memberInFansubs.push(savedFansub._id);
        // await User.findByIdAndUpdate({_id: req.user._id}, user);

        res.status(201).json(savedFansub);
    } catch(err) {
        res.status(400).send(err);
    }

});

//DELETE exist fansub
router.delete('/:fansubId', async (req, res) => {
    const fansubId = req.params.fansubId;
    const deletedFansub = await Fansub.findOneAndRemove({ _id: fansubId });
    if (deletedFansub) {
        return res.status(203).send(deletedFansub);
    }

    res.status(401).send("Fansub Not Found");
});


//UPDATE fansub
router.put('/:fansubId', async (req, res) => {
    const fansubId = req.params.fansubId;

    const oldFansub = await Fansub.find({_id: fansubId});

    if(!oldFansub) {
        return res.status(403).send("Fansub Not Found");
    }
    
    const fansubFields = {...oldFansub, ...req.body};
    const updatedFansub = await Fansub.findOneAndUpdate({_id: fansubId}, fansubFields, {new: true});

    res.status(200).send(updatedFansub);
});


/*** PROJECTS ***/

fansubRouter = require('./fansub');
router.use('/:fansubId/', async (req, res, next) => {
    const fansub = await Fansub.findById({_id: req.params.fansubId}).populate({
        path: 'projects',
        model: 'Project',
        populate: {
          path: 'anime',
          model: 'Anime',
        },
    });
    if(!fansub) {
        return res.status(400).json({error: 'Fansub Not Exist'})
    }
    req.fansub = fansub;
    next();
}, fansubRouter);


module.exports = router;
