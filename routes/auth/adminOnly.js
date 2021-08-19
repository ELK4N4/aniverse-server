import isAdmin from './isAdmin';

export default async function (req,res,next) {
    if(!isAdmin(req.user)) {
        return res.status(403).redirect('/');
    }
    next();
}