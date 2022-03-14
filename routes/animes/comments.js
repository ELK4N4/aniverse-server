import { Router } from '@awaitjs/express';
import { usersOnly } from '../../middlewares/auth.js';
import EpisodeComment from '../../models/EpisodeComment.js';
import validate from '../../middlewares/validation.js';
import * as schemes from '@aniverse/utils/validations/index.js';

const router = Router();

//GET all comments of episodes
router.getAsync('/', async (req, res) => {
    const comments = req.episodeJSON.comments;
    for(let i=0; i < comments.length; i++) {
        if(comments[i].replyTo) {
            const replyTo = await EpisodeComment.findById(comments[i].replyTo).populate({ 
                path: 'addedByUser',
                model: 'User',
                select: 'username avatar',
            });
            if(replyTo) {
                comments[i].replyTo = replyTo;
            } else {
                comments[i].replyTo = "deleted";
            }
        }
    }
    res.json(comments);
});


//POST new comment
router.postAsync('/', usersOnly, validate(schemes.commentScheme), async (req, res) => {
    const comment = new EpisodeComment({
        message: req.body.message,
        addedByUser: req.user._id,
        replyTo: null
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

//POST reply to a comment
router.postAsync('/reply/:commentId', usersOnly, validate(schemes.commentScheme), async (req, res) => {
    const replyComment = req.episode.comments.find(comment => comment._id.equals(req.params.commentId))

    if(!replyComment) {
        return res.status(404).send('Comment not exists');
    }
    
    const comment = new EpisodeComment({
        message: req.body.message,
        addedByUser: req.user._id,
        replyTo: req.params.commentId
    });

    const savedComment = await comment.save();

    req.episode.comments.push(savedComment._id);
    await req.episode.save();
    
    const commentsFields = savedComment.toJSON();

    commentsFields.replyTo = replyComment;
    commentsFields.addedByUser = {
        _id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar
    };

    res.status(201).json(commentsFields);
});

//PUT exist comment
router.putAsync('/:commentId', usersOnly, validate(schemes.commentScheme), async (req, res) => {
    const oldComment = await EpisodeComment.findById(req.params.commentId);
    if(!oldComment) {
        return res.status(404).send('comment not exists');
    }

    if(!oldComment.addedByUser.equals(req.user._id)) {
        return res.status(403).send('Unauthorized');
    }

    const comment = await EpisodeComment.findByIdAndUpdate(req.params.commentId, {message: req.body.message}, {new: true}).populate([{ 
        path: 'addedByUser',
        model: 'User',
        select: 'username avatar',
    },
    {
        path: 'replyTo',
        model: 'EpisodeComment',
        populate: { 
            path: 'addedByUser',
            model: 'User',
            select: 'username avatar',
        },
    }]);

    if(!comment) {
        return res.status(404).send('comment not exists');
    }

    res.json(comment);
});

//DELETE exist episode
router.deleteAsync('/:commentId', usersOnly, async (req, res) => {
    const comment = await EpisodeComment.findOneAndDelete({_id: req.params.commentId, addedByUser: req.user._id});
    if(!comment)
    {
        return res.status(404).send('comment not exists');
    }
    res.json(comment);
});

export default router;
