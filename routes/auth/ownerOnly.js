import isOwner from './isOwner';

export default async function (req,res,next) {
    if(!isOwner(req.user)) {
        return res.status(403).redirect('/');
    }
    next();
}