const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {MenuItem, joiSchema} = require('../models/menuItem');
const admin = require('../middlewares/admin');
const verifyObjectId = require('../middlewares/verifyObjectId');


router.get('/', auth, async (req, res)=>{
    const menuItems = await MenuItem.find({numberAvailable:{$gt:0}});
    res.send(menuItems);
});


router.get('/:id', [auth, verifyObjectId], async (req, res)=>{
    const menuItem = await MenuItem.findById(req.params.id);
    if(!menuItem) return res.status(404).send('Menu Item with the id not found');
    res.send(menuItem);
})

router.post('/', [auth, admin], async (req,res)=>{
    const {value, error} = joiSchema.validate(req.body);

    if(error) return res.status(400).send('Invalid Menu Item object');

    const menuItem = new MenuItem({
        title:value.title,
        price:value.price,
        numberAvailable:value.numberAvailable,
        description:value.description,
        itemType:value.itemType,
        calories:value.calories,
    });

    await menuItem.save();

    res.status(201).send(menuItem);
});


router.put('/:id', [auth, admin, verifyObjectId], async (req, res)=>{
    const menuItem = await MenuItem.findById(req.params.id);
    if(!menuItem) return res.status(404).send('Order with the id not found');

    const {value, error} = joiSchema.validate(req.body);

    if(error) return res.status(400).send('Invalid Menu Item object');


    menuItem.title = value.title;
    menuItem.price = value.price;
    menuItem.numberAvailable = value.numberAvailable;
    menuItem.description = value.description;
    menuItem.itemType = value.itemType;
    menuItem.calories = value.calories;

    await menuItem.save();

    res.status(201).send(menuItem);

});

router.delete('/:id', [auth, admin, verifyObjectId], async (req, res)=>{
    const menuItem = await MenuItem.findById(req.params.id);
    if(!menuItem) return res.status(404).send('Order with the id not found');
    res.send(menuItem);
    menuItem.remove();
});


module.exports = router;