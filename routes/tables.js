const express = require('express');
const auth = require('../middlewares/auth');
const {Table, joiSchema} = require('../models/table');
const router = express.Router();
const joi = require('joi');
const {User} = require('../models/user');
const admin = require('../middlewares/admin');
const verifyObjectId = require('../middlewares/verifyObjectId');


router.get('/',[auth, admin], async (req, res)=>{
    let tables;
    if(req.user.isAdmin){
        tables = await await Table.find();
    }
    else{
        tables = await Table.find().select('-occupandId');
    }

    res.send(tables);
});

router.post('/', auth, async (req, res)=>{
    //console.log(req.user);

    const {error, value}=joiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid table object');

    const table = new Table({
        tableId: value.tableId,
        capacity:value.capacity,
        occupied:value.occupied,
        occupantsNumber: value.occupantsNumber,
    });

    await table.save()
    res.status(201).send(table);
})

const occcupySchema = joi.object({
    occupantsNumber:joi.number().required()
});

router.post('/occupy/:id', auth, async (req, res)=>{
    const {value, error}    = occcupySchema.validate(req.body);

    if(error) return res.status(400).send('Invalid occupy request');

    let table = await Table.findOne({'tableId':req.params.id});

    if(!table) return res.status(404).send('Table could not be found');

    if(table.occupied) return res.status(400).send('Table already occupied');

    //console.log(value.occupantsNumber);

    table.occupied = true;
    table.occupantsNumber = value.occupantsNumber;
    table.occupantId = req.user._id;

    await table.save();

    res.status(200).send('Table occupied');
});

router.post('/unoccupy', auth, async (req, res)=>{
    const tables = await Table.find();
    const table = await Table.findOne({occupantId:req.user._id});

    if(!table)return res.status(400).send('User did not occupy table');

    table.occupantId = null;
    table.occupied = false;
    table.occupantsNumber = 0;

    table.save();
    res.status(200).send('Table unoccupied');
});

router.put('/:id', [auth, admin], async (req, res)=>{
    const {error, value}=joiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid table object'+error);
    let table = await Table.findOne({'tableId':req.params.id});

    if(!table)return res.status(404).send('Table not found')
    
    table.tableId = value.tableId;
    table.capacity =value.capacity;
    table.occupied =value.occupied;
    table.occupantsNumber= value.occupantsNumber;
    
    await table.save()
    res.status(200).send(table);
})






module.exports = router;