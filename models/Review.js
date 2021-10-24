const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true,'Please add a review title'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true,'Please add a review text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true,'Please add a rating between 1 and 10']
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    bootcamp:{
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp'
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('Review',reviewSchema);