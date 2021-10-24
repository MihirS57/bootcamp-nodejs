const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req,res,next) => {
    try{
        const {name,role,password,email} = req.body;
        const user = await User.create({
            name,email,role,password
        });
        
        if(!user){
            return next(new errorResponse("Sorry couldn't add user",400));
        }
        //const token = user.getSignedUserToken();
        sendTokenResponse(user,200,res,'register');
        /*res.status(200)
        .json({
            success: true,
            token: token,
            data: `Welcome ${user.name}, you have successfully registered`
        })*/
    }catch(err){
        console.log(err.name);
        if(err.code == 11000){
            res.status(400)
            .json({
                success: false,
                error: "This email is already registered"
            });
        }else if(err.name == 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message);
            res.status(400)
            .json({
                success: false,
                error: message
            });
        }
        else{
            res.status(400)
            .json({
                success: false,
                error: err.stack
            })
        }
        
    }
}

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req,res,next) => {
    try{
        const {password,email} = req.body;

        if(!password || !email){
            return next(new errorResponse('Email or password missing',401));
        }

        //select method is used because select is true in the User model
        const user = await User.findOne({email}).select('+password');

        if(!user){
            return next(new errorResponse("Email or Password incorrect",401));
        }

        const isMatch = await user.matchPasswords(password)
        if(!isMatch){
            return next(new errorResponse('Email or Password incorrect',401));
        }

        //const token = user.getSignedUserToken();
        sendTokenResponse(user,200,res,'login');

        /*res.status(200)
        .json({
            success: true,
            token: token,
            data: `Welcome back ${user.name}!`
        })*/
    }catch(err){
        console.log(err.name);
        if(err.code == 11000){
            res.status(400)
            .json({
                success: false,
                error: "This email is already registered"
            });
        }else if(err.name == 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message);
            res.status(400)
            .json({
                success: false,
                error: message
            });
        }
        else{
            res.status(400)
            .json({
                success: false,
                error: err.stack
            })
        }
        
    }
}


// @desc    Get user profile
// @route   POST /api/v1/auth/me
// @access  Private
exports.userProfile = async (req,res,next) => {
    /*We can do the below since we are allowing a middleware before hitting this route
    req.user is initialized in the middleware itself
    res.status(200)
    .json({
        success: true,
        Name: req.user.name,
        Email: req.user.email,
        Role: req.user.role,
        AccountCreatedAt: req.user.createdAt
    }) */

    //safer option
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            return next(new errorResponse('Unauthorized User',400));
        }
        res.status(200)
        .json({
            success: true,
            Name: req.user.name,
            Email: req.user.email,
            Role: req.user.role,
            AccountCreatedAt: req.user.createdAt
        })
    }catch(err){
        next(new errorResponse('Some error occured',500));
    }
}

// @desc    Update Details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req,res,next) => {
    
    try{
        const updated = {
            name: req.body.name,
            email: req.body.email
        }
        const user = await User.findByIdAndUpdate(req.user.id,updated,{
            new: true,
            runValidators: true
        });
        if(!user){
            return next(new errorResponse('Unauthorized User',400));
        }
        res.status(200)
        .json({
            success: true,
            data: user
        })
    }catch(err){
        next(new errorResponse('Some error occured',500));
    }
}

// @desc    Update Password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req,res,next) => {
    
    try{
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        
        const user = await User.findById(req.user.id).select('+password');
        if(!user){
            return next(new errorResponse('Unauthorized User',400));
        }
        if(!await user.matchPasswords(currentPassword)){
            return next(new errorResponse('Wrong Password',400));
        }
        user.password = newPassword;
        await user.save({
            validateBeforeSave: true
        })
        sendTokenResponse(user,200,res,'reset password');
    }catch(err){
        next(new errorResponse('Some error occured',500));
    }
}

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req,res,next) => {
    try{
        const user = await User.findOne({
            email: req.body.email
        });
        if(!user){
            return next(new errorResponse('Incorrect email address',500));
        }
        const resetToken = user.getResetPasswordToken();
        console.log(resetToken);
        await user.save({
            validateBeforeSave: false
        })
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
        const options = {
            email: user.email,
            subject: 'Password reset',
            message: `${resetUrl} is your password reset link`
        }
        try{
            await sendEmail(options);
            res.status(200)
            .json({
                success: true,
                data: 'Email sent'
            });
        }catch(err){
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save( {
                validateBeforeSave: false
            });
            return res.status(500)
            .json({
                success: false,
                error: 'Email could not be sent'
            });
        }
        
    }catch(err){
        next(new errorResponse(err,500));
    }
}
// @desc    Reset Password
// @route   PUT /api/v1/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req,res,next) => {
    try{
        const resetToken = req.params.resettoken;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: {$gt: Date.now()}
        });
        if(!user){
            return next(new errorResponse('Invalid token',400))
        }

        //Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        sendTokenResponse(user,200,res,'reset password');

    }catch(err){
        next(new errorResponse(err,500));
    }
}

//get token from model create cookie and send response
const sendTokenResponse = (user,statusCode,res,operation) => {
    const token = user.getSignedUserToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV == 'production'){
        options.secure = true;
    }

    if(operation == 'login'){
        res.status(statusCode)
        .cookie('token',token,options)
        .json({
            success: true,
            token: token,
            data: `Welcome back ${user.name}!`
        });
        
    }else if(operation == 'reset password'){
        res.status(statusCode)
        .json({
            success: true,
            token: token,
            data: `${user.name}, your password was successfully reset`
        });
    }else{
        res.status(statusCode)
        .cookie('token',token,options)
        .json({
            success: true,
            token: token,
            data: `Welcome ${user.name}, you have successfully registered`
        });
    }

    
}