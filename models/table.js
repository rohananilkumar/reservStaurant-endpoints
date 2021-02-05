const mongoose = require('mongoose');
const joi = require('joi');

const tableJoiSchema = joi.object({
    tableId:joi.string().required(),
    capacity:joi.number().required(),
    occupied:joi.boolean().default(false),
    occupantsNumber:joi.number().default(0),
    occupantId:joi.string().default(null)
})

const tableMongooseSchema = new mongoose.Schema({
    tableId:{
        type:String,
        unique:true,
        required:true,
    },
    capacity:{
        type:Number,
        required:true,
        max:1000,
    },
    occupantId:{
        type:String,
        required:false,
        default:null,
    },
    occupied:{
        type:Boolean,
        required:true,
        default:false,
    },
    occupantsNumber:{
        type:Number,
        required:true,
        max:100,
        validate:{
            validator(v){
                return v<=this.capacity;
            }
        }
    }
});

Table = mongoose.model('table', tableMongooseSchema);

module.exports.mongooseSchema = tableMongooseSchema;
module.exports.joiSchema =tableJoiSchema;
module.exports.Table = Table;