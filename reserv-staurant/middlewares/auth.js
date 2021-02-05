const jwt = require('jsonwebtoken');


module.exports = function(req, res, next){
    const token = req.header('x-auth-token');
    //console.log(req);
    if(!token){
        return res.status(401).send('Access denied');
    }
    try{
        const decoded = jwt.verify(token, 'rohan');
        req.user = decoded;
        next();
    }
    catch{
        res.status(400).send('Invalid token.');
    }
}