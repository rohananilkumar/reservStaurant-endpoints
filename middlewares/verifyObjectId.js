const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(req, res,  next){
    if(!ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid Object id');

    next();
}