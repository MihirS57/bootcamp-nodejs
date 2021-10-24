const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        unique: true,
        required: [true,'Please add a course title']
    },
    description: {
        type: String,
        required: [true,'Please add a description']
    },
    weeks: {
        type: String,
        required: [true,'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true,'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true,'Please add a minimum skills'],
        enum: ['Beginner','Intermediate','Advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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
module.exports = mongoose.model('Course',courseSchema);