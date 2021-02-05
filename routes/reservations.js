const express = require('express');
const {Reservation, joiSchema} = require('../models/resrvation')
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const verifyObjectId = require('../middlewares/verifyObjectId');
const { Table } = require('../models/table');
const { User } = require('../models/user');
const { date } = require('joi');

router.get('/', [auth, admin], async (req, res)=>{
    const reservations = await Reservation.find();

    res.send(reservations);
});

router.get('/:id', [auth, verifyObjectId], async (req, res)=>{
    const reservation = await Reservation.findById(req.params.id);
    if(!reservation) return res.status(404).send('Reservation not found');

    if(req.user.isAdmin || reservation.useriId===req.user._id){
        return res.send(reservation);
    }

    else{
        return res.status(401).send('Access denied');
    }
});

//Todo: Debug this code
router.post('/',auth, async (req, res)=>{
    const {value, error} = joiSchema.validate(req.body);
    if(error) return res.status(400).send('Invalid reservation object');

    const table = await Table.findOne({tableId:value.tableId});
    if(!table) return res.status(404).send('Table not found');

    console.log("Hours",value.time.getMinutes(), value.time);

    if(!(value.time.getHours() || value.time.getMinutes())) return res.status(400).send('Invalid time');

    const reservations = await Reservation.find({tableId:table._id, completed:false});

    for (const i of reservations) {
        const reservedTime = i.time;
        const requestedTime = value.time;
        let reservationAvailable = reservedTime.getFullYear() !== requestedTime.getFullYear();
        reservationAvailable &= reservedTime.getMonth() != requestedTime.getMonth();
        reservationAvailable &= reservedTime.getDate() !== requestedTime.getDate();
        reservationAvailable &= reservationTime.getHours() - requestedTime.getHours() <= 1;
        reservationAvailable &= i.userId !== req.user._id;
        if(!reservationAvailable) return res.status(400).send('Reservation Not Available');
    }

    const reservation = new Reservation({
        tableId:value.tableId,
        time:value.time,
        userId:req.user._id,
    });

    await reservation.save();
    return res.status(201).send(reservation);
});

router.get('/:dd/:mm/:yyyy', auth, async (req, res)=>{
    try{
        var date= new Date(`${req.params.yyyy}-${req.params.mm}-${req.params.dd}`);
        console.log(date);
    }
    catch(e){
        res.status(400).send(e);
    }
    console.log(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()+2}`);
    console.log(new Date(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()+2}`));

    const reservations = await Reservation.find({time:{
        $gte:date,
        $lt:new Date(date.getFullYear(), date.getMonth(), date.getDate()+2),
    }});

    res.send(reservations);

})




module.exports = router;