const express = require('express');
const router = express.Router();
const verify = require('../middlewares/user-parser');


router.get('/',verify , async (req, res) => {
    res.json(req.user);
});

module.exports = router;