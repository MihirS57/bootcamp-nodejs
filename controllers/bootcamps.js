const path = require('path');
const errorHandler = require('../middleware/error');
const Bootcamp = require('../models/Bootcamp');
const errorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req,res,next ) =>{
    try{

        // For query info: https://mongoosejs.com/docs/queries.html

        /*let query;
        //Copy of request query
        const reqQuery = { ...req.query };
        
        //Fields to exclude (While selecting specific fields )
        const removeFields = ['select','sort'];    // We don't want select to be matched in the db
        removeFields.forEach(param => delete reqQuery[param]);

        //Create query string
        let queryStr = JSON.stringify(reqQuery);
         
        // creating operators like $gt, $lte
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/,match => `$${match}`);   
        
        // parsing query string in JSON
        query = JSON.parse(queryStr);

        //fetching resources
        //query = Bootcamp.find(query).populate('courses);
        query = Bootcamp.find(query).populate({
            path: 'courses',
            select: 'title description'
        });

        //determining select fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');            
            query = query.select(fields);
        }

        //sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else{
            query = query.sort('-createdAt');
        }

        //executing the query
        const bootcampFetch = await query
        res.status(200)
        .json({
            success: true,
            count: bootcampFetch.length,
            data: bootcampFetch
        })*/
        res.status(200)
        .json(res.advancedResult);
    }catch(err){
        /*res.status(400)
        .json({
            sucess: false,
            error: err
        })*/
        //system generated error
        next(err);
        
        
    }    
}

// @desc    create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamps = async (req,res,next ) =>{
    console.log(req.body);
    let errorvalue = 0;
    req.body.user = req.user.id;

    const bootcampCheck = await Bootcamp.findOne({
        user: req.body.user
    });

    if(bootcampCheck && req.user.role !== 'admin'){
        return next(new errorResponse(`User ${req.user.id} already has a bootcamp published`,400))
    }
    
    const bootcampCreate = await Bootcamp.create(req.body,(err,DATA) => {
        if(err){
            console.log("Error creating bootcamp")
            /*res.status(400)
                .json({
                    success:false,
                    error: err
                });*/
                // for default system generated error use next(err)
                if(err.code == 11000){
                    next(new errorResponse(`Bootcamp named ${req.body.name} already exists`,400));
                }else if(err.name == 'ValidationError'){
                    const message = Object.values(err.errors).map(val => val.message);
                    next(new errorResponse(message,400));
                }else{
                    next(err);
                }
        }else{
            res.status(201)
            .json({
                success: true,
                data: DATA
            });

            

        }
    });
        
}

// @desc    Get a bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req,res,next ) =>{
    try{
        const bootcampGet = await Bootcamp.findById(req.params.id);
        if(!bootcampGet){
            //when we have more than 2 res.send in one block return the first one
            //return res.status(400).json({ success:false });
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }
        res.status(200)
        .json({
            success: true,
            data: bootcampGet
        })
        
    }catch(err){
        /*console.log('Error in Get single')
        res.status(400)
        .json({
            success:false,
            error: err
        });*/
        // next(err) will send system generated error message
        //next(err);  //sends to error handling middleware
        //below next statement sends a custom error message
        next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
    }
}

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req,res,next ) =>{
    try{
        //const bootcampDelete = await Bootcamp.findByIdAndDelete(req.params.id);
        const bootcampCheck = await Bootcamp.findById(req.params.id);
        if(!bootcampCheck){
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }
        if(req.user.id !== bootcampCheck.user.toString() && req.user.role !== 'admin'){
            return next(new errorResponse(`${req.user.name} is not permitted to make changes to this bootcamp.`,401))
        }
        const bootcampDelete = await Bootcamp.findById(req.params.id);
        if(!bootcampDelete){
            /*return res
            .status(400)
            .json({success:false, message:`Bootcamp doesn't exist`});*/
            console.log(`Bro Error at ${err.name}`);
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }else{
            bootcampDelete.remove();
            res
            .status(200)
            .json({success:true, message:`Deleted`});
        }
        
    }catch(err){
        console.log(` Error at ${err.name}`);
        next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
    }
    /*const bootcampDelete = await Bootcamp.findByIdAndDelete(req.params.id, (err,message) => {
        if(err){
            /*res
            .status(400)
            .json({success:false, error:err});
            //next(err);
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }else{
            if(!message){
                /*return res
                .status(400)
                .json({success:false, message:`Bootcamp doesn't exist`});
                next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
            }
            res
            .status(200)
            .json({success:true, message:`Deleted`});
        }
    });*/
    
    
}

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private

exports.updateBootcamp = async (req,res,next ) =>{
    // new: true is given such that the response we get is of the updated bootcamp
    try{
        const bootcampCheck = await Bootcamp.findById(req.params.id);
        if(!bootcampCheck){
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }
        if(req.user.id !== bootcampCheck.user.toString() && req.user.role !== 'admin'){
            return next(new errorResponse(`${req.user.name} is not permitted to make changes to this bootcamp.`,401))
        }
        const bootcampUpdate = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            newValidators: true
        });
        if(!bootcampUpdate){
            return res.status(400).
            json({
                success: false
            });
        }else{
            res.status(200)
            .json({
                success: true,
                data: bootcampUpdate
            })
        }
    }catch(err){
        if(err.name == 'CastError'){
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }else{
            next(err);
        }
    }
    /*const bootcampUpdate = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    },(err,DATA) => {
        if(err){
            if(err.name == 'CastError'){
                next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
            }else{
                next(err);
            }
           /* console.log(err);
            res
            .status(200)
            .json({success:false, error:err});
        }else{
            if(!DATA){
                return res.status(400).json({success: false});
            }else{
                res
                .status(200)
                .json({success:true, message:DATA});
            }
            
        }
    });*/


    
}
// @desc    Get a bootcamp based on zipcode and distance
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
// complex query
exports.getBootcampsInRadius = async (req,res,next ) =>{
    try{
        const { zipcode,distance } = req.params;
        
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        /* Calc radius using radians
        Divide dist by radius of Earth i.e 3963 mi / 6378 km
        */
        const radius = distance/3963;

        const bootcamps = await Bootcamp.find({
            location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }}
        });

        if(!bootcamps){
            next(new errorResponse(`No such Bootcamps found`,404));
        }else{
            res.status(200)
            .json({
                success: true,
                count: bootcamps.length,
                data: bootcamps
            })
        }
        // For more info: https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
    }catch(err){
        res.status(404)
        .json({
            success: false,
            error: err.stack
        });
    }
    
}

// @desc    Upload a bootcamp photo
// @route   PUT /api/v1/bootcamps/:id/photos
// @access  Private
exports.uploadBootcampPhoto = async (req,res,next ) =>{
    try{
        //const bootcampDelete = await Bootcamp.findByIdAndDelete(req.params.id);
        const bootcampCheck = await Bootcamp.findById(req.params.id);
        if(!bootcampCheck){
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }
        if(req.user.id !== bootcampCheck.user.toString() && req.user.role !== 'admin'){
            return next(new errorResponse(`${req.user.name} is not permitted to make changes to this bootcamp.`,401))
        }
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            console.log(`Bro Error at ${err.name}`);
            next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        }else{
            const file = req.files.file;
            //check if file is uploaded
            if(!req.files){
                return next(new errorResponse('Please upload a file',400));
            }
            //check if uploaded file is an image
            if(!file.mimetype.startsWith('image')){
                return next(new errorResponse('Please upload an image file',400));
            }
            //check file size
            if(file.size > process.env.MAX_UPLOAD_SIZE){
                return next(new errorResponse(`File size should less than ${process.env.MAX_UPLOAD_SIZE}`,400));
            }
            
            file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
            file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
                if(err){
                    next(new errorResponse('Error occured while file upload',500));
                }else{
                    await Bootcamp.findByIdAndUpdate(req.params.id,{
                        photo: file.name
                    });
                    res.status(200)
                    .json({
                        success: true,
                        file: file.name
                    });
                    //remember to make file path static in server.js
                }
            })
            
            //console.log(file.name);
        }
        
    }catch(err){
        console.log(` Error at ${err.name}`);
        //next(new errorResponse(`Bootcamp not found at ${req.params.id}`,404));
        res.status(404)
        .json({
            success: false,
            error: err.stack
        });
    }  
    
}