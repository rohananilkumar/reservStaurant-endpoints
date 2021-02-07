const express = require('express');
const app=express();
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const auth = require('./routes/auth');
const tables = require('./routes/tables');
const menuItems = require('./routes/menuItems');
const orders = require('./routes/orders');
const users = require('./routes/users');
const issues = require('./routes/issues');
const reservations = require('./routes/reservations');
app.use(express.json());


mongoose.connect("mongodb://localhost/reservStaurant", ()=> {
    console.log('Connected to db...');
});

app.use('/api/auth/',auth);
app.use('/api/tables/', tables);
app.use('/api/menuitems/',menuItems);
app.use('/api/orders/',orders);
app.use('/api/users/', users);
app.use('/api/issues/', issues);
app.use('/api/reservations/', reservations);

app.listen(3000, ()=>{
    console.log('Server Listening on 3000');
});

