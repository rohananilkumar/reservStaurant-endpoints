const joi = require('joi');
const mongoose = require('mongoose');

const joiSchema = joi.object({
    title: joi.string().min(3).required(),
    price: joi.number().required(),
    numberAvailable: joi.number().default(0),
    description: joi.string().min(5).default('-----'),
    itemType: joi.string().min(3).required(),
    calories: joi.number().required(),
});

const mongooseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:3
    },
    price:{
        type:Number,
        required:true,
    },
    numberAvailable:{
        type:Number,
        default:0,
    },
    description:{
        type:String,
        minlength:5,
        default:'-----'
    },
    itemType:{
        type:String,
        required:true,
        minlength:3
    },
    calories:{
        type:Number,
        required:true
    },

});

const MenuItem = mongoose.model('menuItem', mongooseSchema);

module.exports.joiSchema = joiSchema;
module.exports.mongooseSchema = mongooseSchema;
module.exports.MenuItem = MenuItem;