const express = require('express');
const router = express.Router();
const Fansub = require('../../models/Fansub');

//GET fansub
router.get('/', async (req, res) => {
    res.json(req.fansub);
});

/*** PROJECTS ***/
projectsRouter = require('./projects');
router.use('/projects/', async (req, res, next) => {
    next();
}, projectsRouter);


module.exports = router;