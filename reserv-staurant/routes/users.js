const express = require('express');
const {User} = require("../models/user");
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const verifyObjectId = require('../middlewares/verifyObjectId');

router.get('/', [auth,admin], async (req, res)=>{
    const users = await User.find();

    res.send(users);
});

router.get('/:id', [auth, admin, verifyObjectId], async (req, res)=>{
    const users = await User.findById(req.params.id);

    if(!users) return res.status(404).send('User with the id not found');

    res.send(users);
});

router.get('/me', auth, async (req, res)=>{
    const user = User.findById(req.user._id);
    res.status.send(user);
})


module.exports = router;