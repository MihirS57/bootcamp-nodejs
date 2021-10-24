const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const crypto = require('crypto');


// @desc    Get all user
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getUsers = async (req,res,next) => {
    try{
        res.status(200).json(res.advancedResult);
    }catch(err){
        console.log(err.name);
        res.status(400)
        .json({
            success: false,
            error: err
        });
    }
}

// @desc    Get a user
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
exports.getUser = async (req,res,next) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return next(new errorResponse('User does not exist',400));
        }
        res.status(200)
        .json({
            success: true,
            data: user
        })
    }catch(err){
        console.log(err.name);
        res.status(400)
        .json({
            success: false,
            error: err
        });
    }
}

// @desc    Create a user
// @route   POST /api/v1/auth/users
// @access  Public
exports.createUsers = async (req,res,next) => {
    try{
        const user = await User.findOne({
            email: req.body.email
        });
        if(user){
            return next(new errorResponse('User already exists',400));
        }
        const userIns = await User.create(req.body);
        res.status(200)
        .json({
            success: true,
            message: `${userIns.name} is successfuly registered`,
            data: userIns
        })
    }catch(err){
        console.log(err.name);
        res.status(400)
        .json({
            success: false,
            error: err
        });
    }
}

// @desc    Update details
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Public
exports.updateUser = async (req,res,next) => {
    try{
        const user = await User.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        });
        if(!user){
            return next(new errorResponse('User does not exist',400));
        }
        
        res.status(200)
        .json({
            success: true,
            message: `${user.name} is successfuly registered`,
            data: user
        })
    }catch(err){
        console.log(err.name);
        res.status(400)
        .json({
            success: false,
            error: err.stack
        });
    }
}

// @desc    Delete users
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req,res,next) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return next(new errorResponse('User does not exist',400));
        }
        res.status(200)
        .json({
            success: true,
            message: `User deleted`
        })
    }catch(err){
        console.log(err.name);
        res.status(400)
        .json({
            success: false,
            error: err
        });
    }
}
