function HasRole(role) {
    return function(req, res, next) {
        if (req.user.role.includes(role)) {
            next();
        }
        else
        {
            return res.status(403).redirect('/');
        }
    }
}

export default { HasRole };