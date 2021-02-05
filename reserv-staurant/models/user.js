const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const userMongooseSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:String,
        required:true,
        minlength:10
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        require:false
    },
})

const userJoiSchema = joi.object({
    name:joi.string().required().min(3),
    email:joi.string().email(),
    password:joi.string().min(6),
    phone:joi.string().min(10)
});

userMongooseSchema.methods.generateJwtKey = function(){
    const token = jwt.sign({_id:this._id, isAdmin: this.isAdmin}, 'rohan');
    return token;
}

const user = mongoose.model('User',userMongooseSchema)

module.exports.mongooseSchema = userMongooseSchema;
module.exports.joiSchema = userJoiSchema;
module.exports.User = user;