const error = require('../middleware/error');
const errorHandler = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');


// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = async (req,res,next) => {
    try{
// Something
        const bootcampRId = req.params.bootcampId;
        let query;
        /*if(!bootcampRId){
            //query = Course.find().populate('bootcamp');
            query = Course.find().populate({
                path: 'bootcamp',
                select: 'name description'
            })
        }else{
            query = Course.find({
                bootcamp: bootcampRId
            });
        }
        const courses = await query;
        if(!courses){
            next(new errorHandler('Something went wrong',500));
        }else{
            res.status(200)
            .json({
                success: true,
                count: courses.length,
                data: courses
            })
        }*/
        if(bootcampRId){
            query = Course.find({
                bootcamp: bootcampRId
            });
            const courses = await query;
            if(!courses){
                next(new errorHandler('Something went wrong',500));
            }else{
                res.status(200)
                .json({
                    success: true,
                    count: courses.length,
                    data: courses
                })
            }
        }else{
            res.status(200)
            .json(res.advancedResult);
        }
    }catch(err){
        res.status(404)
        .json({
            success: false,
            error: err.name
        });
    }
};

// @desc    Get a course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = async (req,res,next) => {
    try{
// Something 4
        const course = await Course.findById(req.params.id);
        if(!course){
            next(new errorHandler(`Course not found at ${req.params.id}`,400));
        }else{
            res.status(200)
            .json({
                success: true,
                data: course
            })
        }
    }catch(err){
        next(err);
    }
};

// @desc    create a course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.createCourse = async (req,res,next) => {
    try{
// Something 4
        req.body.user = req.user.id;
        
        req.body.bootcamp = req.params.bootcampId;
        const bootcamps = await Bootcamp.findById(req.params.bootcampId);
        if(!bootcamps){
            next(new errorHandler(`Bootcamp not found at ${req.params.bootcampId}`,400))
        }else{
            if(bootcamps.user.toString() !== req.user.id && req.user.role !== 'admin'){
                return next(new errorHandler(`${req.user.id} is not allowed to make new courses in this bootcamp`,400));
            }
            const course = await Course.create(req.body);
            if(!course){
                next(new errorHandler(`Course not found at ${req.params.id}`,400));
            }else{
                res.status(200)
                .json({
                    success: true,
                    data: course
                })
            }
        }
        
    }catch(err){
        if(err.code == 11000){
            next(new errorHandler(`Course titled ${req.body.title} already exists`,400));
        }else if(err.name == 'ValidationError'){
            const message = Object.values(err.values).map(val => val.message);
            next(new errorHandler(message,400));
        }else{
            
            next(err);
        }
        
    }
};

// @desc    update a course
// @route   PUT /api/v1/courses/:id
// @access  Public
exports.updateCourse = async (req,res,next) => {
    try{
        // Something 4
        const courseCheck = await Course.findById(req.params.id);
        if(!courseCheck){
            next(new errorHandler(`Course not found at ${req.params.id}`,400));
        }
        if(courseCheck.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(new errorHandler(`${req.user.id} is not allowed to make changes`,400));
        }
        const course = await Course.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            newValidators: true
        });
        if(!course){
            next(new errorHandler(`Course not found at ${req.params.id}`,400));
        }else{
            res.status(200)
            .json({
                success: true,
                data: course
            })
        }
    }catch(err){
        next(err);
    }
};

// @desc    delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Public
exports.deleteCourse = async (req,res,next) => {
    try{
// Something 4
        const course = await Course.findByIdAndDelete(req.params.id);
        if(!course){
            next(new errorHandler(`Course not found at ${req.params.id}`,400));
        }else{
            res.status(200)
            .json({
                success: true,
                data: course
            })
        }
    }catch(err){
        next(err);
    }
};

/*
exports.postCourse = (req,res,next) => {
    try{
// Something 1
    }catch(err){

    }
};

exports.updateCourse((req,res,next) => {
    try{
// Something 

    }catch(err){

    }
});

exports.deleteCourses((req,res,next) => {
    try{
// Something 3

    }catch(err){

    }
});

*/