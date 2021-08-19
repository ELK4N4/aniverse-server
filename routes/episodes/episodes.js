import { Router } from 'express';
import Episode from '../../models/Episode.js';
import Project from '../../models/Project.js';
import Anime from '../../models/Anime.js';
import verify from '../../middlewares/user-parser.js';

const router = Router();

//GET all anime episodes
router.get('/', async (req, res) => {
    const episodes = await Episode.find({anime: req.anime._id});
    const projects = await Project.find({anime: req.anime._id});
    
    res.json(episodes);
});

// GET episode
router.get('/:episodeId', async (req, res) => {
    const episode = await Episode.findById({_id: req.params.episodeId}).populate('addedByFansub');
    if(!episode) {
        return res.status(403).json({error: "Episode Not Found"});
    }

    episode.views++;
    await episode.save();

    episode.anime = req.anime;
    res.status(200).send(episode);
});

//POST new episodes
router.post('/', verify, async (req, res) => {
    // TODO add check if user member in fansubId...
    const episodeExist = await Episode.findOne({number: req.body.number, addedByFansub: req.body.addedByFansub});

    if(episodeExist) {
        return res.status(400).send('Episode already exist');
    }

    const episode = new Episode({
        anime: req.anime._id,
        name: req.body.name,
        number: req.body.number,
        link: req.body.link,
        image: req.body.image,
        post: req.body.post,
        addedByUser: req.user._id,
        addedByFansub: req.body.addedByFansub
    });

    try {
        const savedEpisode = await episode.save();

        const anime = await Anime.findById({_id: req.anime._id});
        anime.episodes.push(savedEpisode._id);
        await Anime.findByIdAndUpdate({_id: req.anime._id}, anime);

        const project = await Project.findOne({anime: req.anime._id});
        project.episodes.push(savedEpisode._id);
        await Project.findOneAndUpdate({anime: req.anime._id}, project);
        
        res.status(201).json(savedEpisode);
    } catch(err) {
        res.status(400).send(err);
    }

});

//DELETE exist episode
router.delete('/:episodeId', async (req, res) => {
    const episodeId = req.params.episodeId;

    const deletedEpisode = await Episode.findOneAndRemove({ _id: episodeId });

    if (deletedEpisode) {
        const anime = await Anime.findById({_id: req.anime._id});
        anime.episodes = anime.episodes.filter(episode => episode._id.toString() !== deletedEpisode._id.toString());
        await Anime.findByIdAndUpdate({_id: req.anime._id}, anime);

        const project = await Project.findOne({anime: req.anime._id});
        project.episodes = project.episodes.filter(episode => episode._id.toString() !== deletedEpisode._id.toString());
        await Project.findOneAndUpdate({anime: req.anime._id}, project);
        
        return res.status(203).send(deletedEpisode);
    }

    res.status(401).send("Episode Not Found");
});



// /*** SPECIFIC EPISODES ***/


// episodesRouter = require('./episodes');
// router.use('/:project/', (req, res, next) => {
//     const projectName = req.params.project.replace(/-/g," ");
//     req.project = projectName;
//     next();
// }, episodesRouter);


export default router;
