const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Fansub = require('../../models/Fansub');
const Anime = require('../../models/Anime');

const verify = require('../../middlewares/user-parser');


//GET all projects
router.get('/', async (req, res) => {
    const projects = await Project.find();
    res.json(projects);
});

//POST new project
router.post('/', verify, async (req, res) => {
    const anime = await Anime.findById({_id: req.body.animeId});
    if(!anime) {
        return res.status(400).send('Anime Not Exist');
    }
    const projectExist = await Project.findOne({anime: anime._id});
    
    if(projectExist) {
        return res.status(400).send('Project Exist');
    }

    const project = new Project({
        anime: anime._id,
        fansub: req.fansub._id,
        addedByUser: req.user._id
    });

    try {
        const savedProject = await project.save();

        anime.fansubs.push(req.fansub._id);
        await Anime.findOneAndUpdate({_id: anime._id}, anime, {new: true});

        req.fansub.projects.push(savedProject._id);
        await Fansub.findOneAndUpdate({_id: req.fansub._id}, req.fansub, {new: true});

        res.status(201).json(savedProject);
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



// /*** SPECIFIC EPISODES ***/


// episodesRouter = require('./episodes');
// router.use('/:project/', (req, res, next) => {
//     const projectName = req.params.project.replace(/-/g," ");
//     req.project = projectName;
//     next();
// }, episodesRouter);


module.exports = router;
