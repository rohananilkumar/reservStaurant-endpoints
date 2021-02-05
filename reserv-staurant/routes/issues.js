const express = require('express');
const {Issue, joiSchema} = require('../models/issue');
const router = express.Router();
const {Table} = require('../models/table');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const verifyObjectId = require('../middlewares/verifyObjectId');

router.get('/', [auth, admin], async (req, res)=>{
    const issues = await Issue.find();
    res.send(issues);
});

router.get('/:id', [auth, verifyObjectId], async (req, res)=>{
    const issue = await Issue.findById(req.params.id);

    if(!issue) return res.status(404).send('issue not found');

    if(issue.userId != req.user._id ) {
        if(req.user.isAdmin){
            res.status(200).send(issue);
        }
        else{
            res.status(401).send('Access denied');
        }
    }
    else{
        res.status(200).send(issue);
    }
});


router.post('/', auth, async (req, res)=>{
    const {value, error} = joiSchema.validate(req.body);

    if(error) return res.status(400).send('Invalid issue object');

    const table = await Table.findOne({occupantId:req.user._id});

    if(!table) return res.status(400).send('User has not occupied any table');

    const issue = new Issue({
        callManager:value.callManager,
        callWaiter:value.callWaiter,
        userId:req.user._id,
        tableId:table._id,
    });

    issue.save();
    res.status(201).send(issue);
});

router.post('/solve/:id', [auth, admin, verifyObjectId], async (req, res)=>{
    const issue = await Issue.findById(req.params.id);

    if(!issue) return res.status(404).send('issue not found');

    issue.solved = true;

    await issue.save();
    res.status(200).send(issue);
});

router.get('/tables/:id', [auth, admin], async (req, res)=>{
    const table = await Table.findOne({tableId:req.params.id});
    if(!table) return res.status(404).send('Table not found');

    const issue = await Issue.findOne({tableId:table._id, solved:false});

    if(!issue) return res.status(404).send('Could not find any unresolved issues with that table');

    res.status(200).send(issue);
});

router.delete('/:id', [auth, admin, verifyObjectId], async (req, res)=>{
    const issue = await Issue.findById(req.params.id);

    if(!issue) return res.status(404).send('issue not found');

    res.status(200).send(issue);
    issue.remove();

})




module.exports = router;

