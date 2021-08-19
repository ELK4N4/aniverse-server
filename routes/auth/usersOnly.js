import isUser from './isUser';

export default async function (req,res,next) {
    if(!isUser(req.user)) {
        return res.status(403).redirect('/');
    }
    next();
}