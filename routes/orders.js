const express = require('express');
const router = express.Router();
const {Order, joiSchema, orderListJoiSchema} = require('../models/order');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const {User} = require('../models/user');
const {Table} = require('../models/table');
const {MenuItem} = require('../models/menuItem');
const verifyObjectId = require('../middlewares/verifyObjectId');

router.get('/', [auth, admin], async (req, res)=>{
    const orders = await Order.find();
    res.send(orders);
})

router.post('/', auth, async (req, res)=>{
    const {value, error} = joiSchema.validate(req.body);

    if(error) return res.status(400).send(error);

    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).send('User with user id not found');

    const table = await Table.findOne({occupantId:user._id});
    if(!table) return res.status(404).send('User has not occupied any table');

    const existingOrder = await Order.findOne({userId:user._id, billed:false});
    if(existingOrder) return res.status(400).send('User has not billed previous order');

    const orders = Array();
    
    for (const order of value.order) {
        const menuItem = await MenuItem.findById(order.menuItemId);

        if(!menuItem) return res.status(404).send('Order with order id not found');

        const quantity = order.quantity;
        if(quantity > menuItem.numberAvailable) return res.status(400).send(`${menuItem.title} is only available ${menuItem.numberAvailable} number`);
        
        menuItem.numberAvailable -= quantity;
        await menuItem.save();

        orders.push({menuItemId:order.menuItemId, menuItem:menuItem, quantity:quantity});
    }

    const order = new Order({
        userId:user._id,
        tableId:table._id,
        order:orders.map(x=>{return {menuItemId:x.menuItemId, quantity:x.quantity}})
    })

    await order.save();
    res.status(201).send(order);

});



//body
//{order:[orders]}
router.post('/extend/:id', [auth, verifyObjectId], async (req, res)=>{
    const order = await Order.findById(req.params.id);

    if(!order) return res.status(404).send('Order with order id not found');

    const {value, error} = joiSchema.validate(req.body);

    if(error) return res.status(400).send('Invalid order object');

    for(var i of value.order){
        const existingMenuItem = order.order.find(x=>x.menuItemId==i.menuItemId);
        if(existingMenuItem){
            //Order with same menu item exists. Update quantity
            existingMenuItem.quantity+=i.quantity;
        }
        else{
            if(!await MenuItem.findById(i.menuItemId)) return res.status(404).send('invalid menu item id');
            order.order.push({menuItemId:i.menuItemId, quantity:i.quantity});
        }
    }
    await order.save();
    res.status(200).send(order);
    
})

router.delete('/:id', [auth, admin, verifyObjectId], async (req, res)=>{
    const order = await Order.findById(req.params.id);

    if(!order) return res.status(404).send('Order with order id not found');

    res.status(200).send(order);
    await order.remove();
});

router.post('/bill', auth, async (req, res)=>{
    const order = await Order.findOne({userId:req.user._id, billed:false});
    if(!order) return res.status(404).send('bill for the given user was not found');
    await order.calculateBill();
    await order.save();
    res.send(order);
})



module.exports = router;