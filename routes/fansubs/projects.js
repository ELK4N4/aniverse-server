import { Router } from '@awaitjs/express';
import Project from '../../models/Project.js';
import Anime from '../../models/Anime.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';

const router = Router();

//GET all projects details
router.getAsync('/', async (req, res) => {
    const projects = await Project.find({fansub: req.fansub._id}).populate('anime');
    if(!projects) {
        return res.status(400).send('Projects Not Exist');
    }
    const projectsWithRating = JSON.parse(JSON.stringify(projects));
    for (let index = 0; index < projects.length; index++) {
        projectsWithRating[index].anime.rating = await projects[index].anime.getRating();
    }
    res.json(projectsWithRating);
});

router.getAsync('/:projectId', async (req, res) => {
    const project = await Project.findById(req.params.projectId).populate({
        path: 'episodes',
        model: 'Episode',
        options: { sort: { 'number': 0 } }
    });
    if(!project) {
        return res.status(400).send('Projects Not Exist');
    }
    res.json(project);
});

//POST new project
router.postAsync('/', hasFansubPermissions('projects'), async (req, res) => {
    const anime = await Anime.findById(req.body._id);
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

    const savedProject = await project.save();
    if(savedProject) {
        savedProject.anime = anime;
        const users = await User.find({followingFansubs: {$all: req.fansub._id} });
        users.forEach(async (user) => {
            const notification = new Notification({
                message: `הפאנסאב ${req.fansub.name} מתחיל לתרגם את ${savedProject.anime.name.hebrew}!`,
                link: `/animes/${savedProject.anime._id}/episodes?fansub=${req.fansub._id}`,
                userId: user._id
            });
        
            await notification.save();
        })
    }
        
    res.status(201).json(savedProject);
});

//DELETE project
router.deleteAsync('/:projectId', hasFansubPermissions('projects'), async (req, res) => {
    const deletedProject = await Project.findByIdAndRemove(req.params.projectId);
    if (deletedProject) {
        return res.status(203).send(deletedProject);
    }

    res.status(401).send('Project Not Found');
});

//PUT project status
router.putAsync('/:projectId/status', hasFansubPermissions('projects'), async (req, res) => {
    const updatedProjectStatus = await Project.findByIdAndUpdate(req.params.projectId, {status: req.body.status}, {new: true}).populate('anime');
    if (updatedProjectStatus) {
        return res.status(203).send(updatedProjectStatus);
    }

    res.status(401).send('Project Not Found');
});

/*** EPISODES ***/
import episodesRouter from './episodes.js';
import { hasFansubPermissions } from '../../middlewares/auth.js';
router.useAsync('/:projectId/episodes/', async (req, res, next) => {
    const project = await Project.findById(req.params.projectId).populate([{
        path: 'episodes',
        model: 'Episode',
    }, {
        path: 'anime',
        model: 'Anime',
    }]);
    if(!project) {
        return res.status(400).json({error: 'Project Not Exist'});
    }
    req.project = project;
    next();
}, episodesRouter);


export default router;
