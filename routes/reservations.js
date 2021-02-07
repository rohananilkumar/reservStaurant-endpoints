const express = require('express');
const {Reservation, joiSchema} = require('../models/resrvation')
const router = express.Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const verifyObjectId = require('../middlewares/verifyObjectId');
const { Table } = require('../models/table');
const { User } = require('../models/user');
const luxon = require('luxon');
const { Console } = require('winston/lib/winston/transports');

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

    //console.log(Date.parse(value.time));

    try{
        value.time = new Date(value.time);
    }
    catch(e){
        return res.status(400).send(e);
    }
    const userExistingReservation = await Reservation.findOne({userId:req.user._id, completed:false});
    if(userExistingReservation) return res.status(400).send("User has a reservation already");

    let date = value.time;
    let afterTime = new Date(date.getTime()-60*60*1000);
    let beforeTime = new Date(date.getTime()+60*60*1000);

    const existingReservation = await Reservation.findOne({tableId:table._id, completed:false, time:{
        $gt:afterTime,
        $lt:beforeTime,
    }});
    if(existingReservation) return res.status(400).send("Table already reserved");


    /*
    const reservations = await Reservation.find({tableId:table._id, completed:false});
    const checkExistingReservation = await Reservation.findOne({userId:req.user._id, completed:false});
    console.log(checkExistingReservation);
    if(checkExistingReservation) return res.status(400).send("User has a reservation already");

    for (const i of reservations) {
        const reservedTime = i.time;
        console.log("ReservedTime:",reservedTime.c);
        const requestedTime = value.time;
        console.log("Requested time",requestedTime.c)
        console.log("Duration:", new Date(reservedTime-requestedTime));
        
        const hourDifference = ((reservedTime-requestedTime)/3600000);

        if(Math.abs(hourDifference)<1) return res.status(400).send('Reservation Not Available');

    }
    */

    const reservation = new Reservation({
        tableId:table._id,
        time:value.time,
        userId:req.user._id,
    });

    await reservation.save();
    return res.status(201).send(reservation);
});

router.get('/:dd/:mm/:yyyy', auth, async (req, res)=>{

    try{
        var date = new Date(Number.parseInt(req.params.yyyy), Number.parseInt(req.params.mm)-1,Number.parseInt(req.params.dd));
    }
    catch(e){
        res.status(400).send("Invalid Date");
        return console.log("Error");
    }
    console.log(date);
    console.log(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
    
    const reservations = await Reservation.find({time:{
        $gte:date,
        $lt:new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    }});

    res.send(reservations);

});

router.delete('/:id', [auth, verifyObjectId], async (req, res)=>{
    const reservation = await Reservation.findById(req.params.id);
    if(!reservation) return res.status(404).send('Reservation not found');

    if(req.user.isAdmin || reservation.useriId===req.user._id){
        res.send(reservation);
        return reservation.remove();
    }

    else{
        return res.status(401).send('Access denied');
    }
})


router.get('/myreservations', auth, async (req, res)=>{
    //Untested
    const reservations = await Reservation.find({userId:req.user._id});
    res.status(200).send(reservations);
});

router.get('/myreservations/active', auth, async (req, res)=>{
    //Untested
    const reservation = await Reservation.findOne({userId:req.user._id, completed:false});
    res.status(200).send(reservations);
});




module.exports = router;



//The endpoint expects time in IST
//Stores as UTC
//Time format 2021-02-06T09:00:00.00