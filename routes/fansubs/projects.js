const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Fansub = require('../../models/Fansub');
const Anime = require('../../models/Anime');

const verify = require('../../middlewares/user-parser');


//GET all projects details
router.get('/', async (req, res) => {
    const projects = await Project.find({fansub: req.fansub._id}).populate('anime');
    if(!projects) {
        return res.status(400).send('Projects Not Exist');
    }
    res.json(projects);
});

router.get('/:projectId', async (req, res) => {
    const project = await Project.findById({_id: req.params.projectId}).populate({
        path: 'episodes',
        model: 'Episode',
    });;
     if(!project) {
        return res.status(400).send('Projects Not Exist');
    }
    res.json(project);
});

//POST new project
router.post('/', verify, async (req, res) => {
    const anime = await Anime.findById({_id: req.body._id});
    if(!anime) {
        return res.status(400).send('Anime Not Exist');
    }
    const projectExist = await Project.findOne({anime: anime._id, fansub: req.fansub._id});
    
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
        savedProject.anime = anime;
        res.status(201).json(savedProject);
    } catch(err) {
        res.status(400).send(err);
    }
});

//DELETE project
router.delete('/:projectId', verify, async (req, res) => {
    const deletedProject = await Project.findByIdAndRemove({ _id: req.params.projectId });
    if (deletedProject) {
        return res.status(203).send(deletedProject);
    }

    res.status(401).send("Project Not Found");
});

/*** EPISODES ***/
episodesRouter = require('./episodes');
router.use('/:projectId/episodes/', async (req, res, next) => {
    const project = await Project.findById({_id: req.params.projectId}).populate({
        path: 'episodes',
        model: 'Episode',
    });
    if(!project) {
        return res.status(400).json({error: 'Project Not Exist'})
    }
    req.project = project;
    next();
}, episodesRouter);


module.exports = router;
