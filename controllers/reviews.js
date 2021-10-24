const errorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const advancedResult = require('../middleware/advancedResults');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = async (req,res,next) => {
    try{
        const bootcampId = req.params.bootcampId;
        if(bootcampId){
            console.log("1",bootcampId);
            const bootcamp = await Bootcamp.findById(bootcampId);
            if(!bootcamp){
                return next(new errorResponse('Bootcamp not found',400));
            } 
            const reviews = await Review.findOne({
                bootcamp: bootcampId
            });
            if(!reviews){
                return next(new errorResponse('Reviews for this bootcamp not found',400));
            }
            res.status(200)
            .json({
                success: true,
                count: reviews.length,
                review: reviews
            })
        }
        else{
            console.log("3");
            res.status(200)
            .json(res.advancedResult)
        }
    }catch(err){
        console.log(err.stack);
        res.status(404)
        .json({
            success: false,
            error: err.name
        });
    }
};

// @desc    Get a single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = async (req,res,next) => {
    try{
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId).populate({
            path: 'user bootcamp',
            select: 'name email description'
        });
         
        if(!review){
            return next(new errorResponse('Review not found',404));
        }
        res.status(200)
        .json({
            success: true,
            review: review
        })
    }catch(err){
        console.log(err.name);
        res.status(404)
        .json({
            success: false,
            error: err.stack
        });
    }
}

// @desc    Post reviews
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.postReview = async (req,res,next) => {
    try{
        const bootcampId = req.params.bootcampId;
        if(bootcampId){
            console.log("1",bootcampId);
            const bootcamp = await Bootcamp.findById(bootcampId);
            if(!bootcamp){
                return next(new errorResponse('Bootcamp not found',400));
            } 
            const reviewExist = await Review.findOne({
                bootcamp: bootcampId,
                user: req.user.id
            });
            if(reviewExist){
                return next(new errorResponse('Only one review per user is allowed for a bootcamp',400));
            }
            req.body.bootcamp = bootcampId;
            req.body.user = req.user.id;
            const reviews = await Review.create(req.body);
            if(!reviews){
                return next(new errorResponse('Some error occured while posting a review',400));
            }
            res.status(200)
            .json({
                success: true,                
                review: reviews
            })
        }else{
            return next(new errorResponse('Bootcamp ID not found',400));
        }
        
    }catch(err){
        console.log(err.stack);
        res.status(404)
        .json({
            success: false,
            error: err.name
        });
    }
};