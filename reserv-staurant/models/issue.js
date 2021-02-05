const { boolean } = require('joi');
const joi = require('joi');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const joiSchema = joi.object({
    callManager: joi.boolean().default(false),
    callWaiter : joi.boolean().default(false),
});

const mongooseSchema = new mongoose.Schema({
    issueNumber:{
        type:Number,
    },
    userId:{
        type:String,
        required:true,
    },
    tableId:{
        type:String,
        required:true,
    },
    callManager:{
        type:Boolean,
        default:false
    },
    callWaiter:{
        type:Boolean,
        default:false,
    },
    solved:{
        type:Boolean,
        default:false,
    }
});

mongooseSchema.plugin(autoIncrement.plugin, {
    model:'issue',
    field:'issueNumber',
    startAt:1,
    incrementBy:1
});

const Issue = mongoose.model('issue', mongooseSchema);

module.exports.mongooseSchema = mongooseSchema;
module.exports.joiSchema = joiSchema;
module.exports.Issue = Issue;
