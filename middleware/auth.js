const errorResponse = require('../utils/errorResponse')
const jwt = require('jsonwebtoken');
const User = require('../models/User')

exports.protect = async (req,res,next) => {
    try{

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            const token = req.headers.authorization.split(' ')[1];
            if(!token){
                return next(new errorResponse('Unauthorized',401));
            }
            console.log('Token ',token)
            const identity = jwt.verify(token,process.env.JWT_SECRET_CODE);
            console.log('Identity: ',identity);
            req.user = await User.findById(identity.id);
            if(!req.user){
                return next(new errorResponse('Unauthorized',401))
            }
            next();
        }else{
            next(new errorResponse('Unauthorized',401));
        }

    }catch(err){
        console.log(err.name);
        if(err.name == 'JsonWebTokenError'){
            next(new errorResponse('Token unrecognized',401));
        }else{
            next(new errorResponse(err.name,401));
        }
        
    }
}

exports.authorize = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            console.log('Role not authorized')
            next(new errorResponse(`User role ${req.user.role} not authorized to access this route`,403));
        }
        next();
    }
}