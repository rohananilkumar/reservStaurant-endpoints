const joi = require('joi');
const mongoose = require('mongoose');
const {MenuItem} = require('./menuItem');
const autoIncrement = require('mongoose-auto-increment');
const { bool, boolean } = require('joi');
autoIncrement.initialize(mongoose.connection);

const orderListSchema = joi.object().keys({
    menuItemId:joi.string().required(),
    quantity:joi.number().required(),
    
})

const joiSchema = joi.object({
    order:joi.array().items(orderListSchema),
    isParcel:joi.boolean().default(false),
})

const orderListMongooseSchema = new mongoose.Schema({
    menuItemId: {
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
});

const mongooseSchema = new mongoose.Schema({
    placed:{
        type:Date,
        default:new Date(),
    },
    userId:{
        type:String,
        required:true
    },
    tableId:{
        type:String,
    },
    order:{
        type:[orderListMongooseSchema],
        required:true,
    },
    orderNumber:{
        type:Number,
        
    },
    recieved:{
        type:Boolean,
        default:false,
    },
    billed:{
        type:Boolean,
        default:false
    },
    bill:{
        type:Number,
        default:null,
    },
    isParcel:{
        type:Boolean,
        default:false,
    }
})

mongooseSchema.methods.calculateBill =async function(){
    this.bill = 0;
    for (const i of this.order) {
        const menuItem = await MenuItem.findById(i.menuItemId);
        this.bill+=menuItem.price * i.quantity;
    }
    this.billed = true;
}

mongooseSchema.plugin(autoIncrement.plugin,{
    model:'order',
    field:'orderNumber',
    startAt:1,
    incrementBy:1
})

const Order = mongoose.model('order',mongooseSchema);

module.exports.joiSchema = joiSchema;
module.exports.mongooseSchema = mongooseSchema;
module.exports.Order = Order;
module.exports.orderListJoiSchema = orderListSchema;
