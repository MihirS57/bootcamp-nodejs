//installed jsonwebtoken bcryptjs
const jwt = require('jsonwebtoken');
const becrypt = require('bcryptjs');
const crypto = require('crypto');   //core module, no install needed
const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please provide the name of the user']
    },
    email: {
        type: String,
        required: [true,'Please provide the email of the user'],
        unique: true,
        match: [
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            'Please provide a valid email ID'
        ]
    },
    role:{
        type: String,
        enum: ['user','publisher','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Encrypt password using bcrypt
UserSchema.pre('save',async function(next) {

    if(!this.isModified('password')){   //this is to get away with password reset token saving the details
        next();
    }

    const salt = await becrypt.genSalt(10);
    this.password = await becrypt.hash(this.password,salt);
    next();
});

//Sign JWT and return For more: jwt.io
UserSchema.methods.getSignedUserToken = function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET_CODE,{
        expiresIn: process.env.JWT_TOKEN_EXPIRY
    });
}
//Generate and hash crypto schema
UserSchema.methods.getResetPasswordToken = function(){
    //generate reset password token
    const resetToken = crypto.randomBytes(20).toString('hex');
    //hash set reset token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 10000;
    return resetToken;
}

UserSchema.methods.matchPasswords = async function(passwordIn){
    return await becrypt.compare(passwordIn,this.password);
}

module.exports = mongoose.model('User',UserSchema);