const joi = require('joi');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const joiSchema = joi.object({
    tableId:joi.string().required(),
    time:joi.date(),
});

const mongooseSchema = new mongoose.Schema({
    tableId:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true,
    },
    time:{
        type:Date,
        required:true,
    },
    endTime:{
        type:Date,
        default:null
    },
    completed:{
        type:Boolean,
        default:false,
    }
})

mongooseSchema.methods.complete = function(){
    this.completed = true;
    endTime = new Date();
}

const Reservation = mongoose.model('reservation', mongooseSchema);

module.exports.mongooseSchema = mongooseSchema;
module.exports.joiSchema = joiSchema;
module.exports.Reservation = Reservation;