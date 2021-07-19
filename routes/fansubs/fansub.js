const express = require('express');
const router = express.Router();
const Fansub = require('../../models/Fansub');

//GET fansub
router.get('/', async (req, res) => {
    res.json(req.fansub);
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
projectsRouter = require('./projects');
router.use('/projects/', async (req, res, next) => {
    next();
}, projectsRouter);


module.exports = router;