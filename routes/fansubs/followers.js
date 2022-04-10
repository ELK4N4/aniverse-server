import { Router } from '@awaitjs/express';

const router = Router();

//GET followers count
router.getAsync('/', async (req, res) => {
    res.json(req.fansub.followers);
});

//POST new follower
router.postAsync('/', async (req, res) => {
    if(req.user.followingFansubs.includes(req.fansub._id)){
        return res.status(300).send('You are already following');
    }
    req.user.followingFansubs.push(req.fansub._id);
    await req.user.save();
    
    req.fansub.followers++;
    await req.fansub.save();

    res.status(203).send('Following successfully');
});

//DELETE follower
router.deleteAsync('/', async (req, res) => {
    if(!req.user.followingFansubs.includes(req.fansub._id)){
        return res.status(401).send('You are not following');
    } else {
        let index = req.user.followingFansubs.indexOf(req.fansub._id);
        req.user.followingFansubs.splice(index, 1);
        await req.user.save();
        
        req.fansub.followers--;
        await req.fansub.save();
    }

    res.status(203).send('Unfollowing successfully');
});

export default router;