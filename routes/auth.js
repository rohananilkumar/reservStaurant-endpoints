const express = require('express');
let router = express.Router();
const joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {mongooseSchema, joiSchema, User}= require('../models/user');
//const { error } = require('winston');


router.post('/register',async (req, res)=>{
   const {error, value} = joiSchema.validate(req.body);
   if(error){
       res.status(400).send(error);
       return;
   } 

   let user = User.findOne({email:value.email})

   if(user){
       res.status(400).send('User already exists');
       return;
   }

   user = new User({
    name:value.name,
    email:value.email,
    phone:value.phone,
    password:value.password
   });

   //console.log(user.password);

   const salt = await bcrypt.genSalt(10);  
    user.password = await bcrypt.hash(user.password,salt);

   await user.save();

   res.header('x-auth-token',user.generateJwtKey()).status(201).send({name:user.name, email:user.email, _id:user._id});

});


const loginSchema = joi.object({
    email:joi.string().required().email(),
    password:joi.string().required()
})

router.post('/login', async (req, res)=>{
   const {error, value} = loginSchema.validate(req.body);

   if(error){
       res.status(400).send('Bad request');
       return;
   }

   const user = await User.findOne({email:value.email});
   if(!user){
       res.status(404).send('Invaid credentials');
       return;
   }
   //console.log(user.password, value.password);
   const validPassword = await bcrypt.compare(value.password,user.password)
   if(!validPassword){
       res.status(400).send('Invaid credentials');
       return;
   }

   res.header('x-auth-token',user.generateJwtKey()).status(200).send('Logged in');
});


module.exports = router;