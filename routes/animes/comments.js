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

    // Check if there is a reply and if it on same episode
    if(req.body.replyTo)
    {
        const replyComment = (await EpisodeComment.findById(req.body.replyTo));
        if(!replyComment || !req.episode.comments.filter(comment => comment._id == replyComment._id))
        {
            req.body.replyTo = null;
        }
    }
    
    const comment = new EpisodeComment({
        message: req.body.message,
        addedByUser: req.user._id,
        replyTo: req.body.replyTo ?? null
    });

    const savedComment = await comment.save();

    req.episode.comments.push(savedComment._id);
    await req.episode.save();
    
    const commentsFields = savedComment.toJSON();
    commentsFields.addedByUser = {
        _id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar
    };
    
    res.status(201).json(commentsFields);
});

//UPDATE exist episode
router.putAsync('/:commentId', async (req, res) => {
    const comment = await EpisodeComment.findOneAndUpdate({_id: req.params.commentId}, {message: req.body.message}, {new: true}).populate({
        path: 'addedByUser',
        model: 'User',
        select: 'username avatar',
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
