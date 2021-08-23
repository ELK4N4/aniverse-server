import { Router } from '@awaitjs/express';
import EpisodeComment from '../../models/EpisodeComment.js';

const router = Router();

//GET all comments of episodes
router.getAsync('/', async (req, res) => {
    const comments = req.episode.comments;

    res.json(comments);
});


//POST new comment
router.postAsync('/', async (req, res) => {

    const comment = new EpisodeComment({
        message: req.body.message,
        addedByUser: req.user._id,
    });

    const savedComment = await comment.save();

    req.episode.comments.push(savedComment._id);
    await req.episode.save();
    
    const jsonComment = {...savedComment};
    jsonComment.addedByUser = {
        _id: req.user._id,
        username: req.user.username
    }
    res.status(201).json({jsonComment});

});

//UPDATE exist episode
router.putAsync('/:commentId', async (req, res) => {
    const comment = await EpisodeComment.findOneAndUpdate({_id: req.params.commentId}, {message: req.body.message}, {new: true}).populate({
        path: 'addedByUser',
        model: 'User',
        select: 'username profileImage',
    });

    if(!comment)
    {
        return res.status(404).send('comment not exists');
    }
    res.json(comment);
});

//DELETE exist episode
router.deleteAsync('/:commentId', async (req, res) => {
    const comment = await EpisodeComment.findOneAndDelete({_id: req.params.commentId});
    if(!comment)
    {
        return res.status(404).send('comment not exists');
    }
    res.json(comment);
});

export default router;