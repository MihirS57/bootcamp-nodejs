const express = require('express');
const router = express.Router();
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');
const {getBootcamp
    ,getBootcamps
    ,createBootcamps
    ,deleteBootcamp
    ,updateBootcamp
    ,getBootcampsInRadius
    ,uploadBootcampPhoto} = require('../controllers/bootcamps');


const Bootcamp = require('../models/Bootcamp');
const advancedResult = require('../middleware/advancedResults');
const {protect,authorize} = require('../middleware/auth');

router.route('/').get(advancedResult(Bootcamp,{
    path: 'courses',
    select: 'title description'
}),getBootcamps).post(protect,authorize('publisher','admin'),createBootcamps);

router.use('/:bootcampId/courses',courseRouter);
router.use('/:bootcampId/reviews',reviewRouter);

router.route('/:id/photos').put(protect,authorize('publisher','admin'),uploadBootcampPhoto);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher','admin'),updateBootcamp)
.delete(protect, authorize('publisher','admin'), deleteBootcamp);

//const {getCourses} = require('../controllers/courses');
//router.route('/:bootcampId/courses').get(getCourses);
//router.route('/').get(getBootcamps).post(createBootcamps);


module.exports = router;

/*router.get('/',(req,res) =>{
    //res.send('<h1>Hello from express</h1>')
    //res.json({name:'Mihir'});
    //res.sendStatus(400)
    //res.status(400).json({error:"Bad Request", success: false});
    //res.status(200).send({message:'All Good'});
    res.status(200).json({success:true,message:'Show all bootcamps'});
});

router.get('/:id', (req,res) => {
    res
    .status(200)
    .json({success:true, message:`Get bootcamp ${req.params.id}`});
});

router.post('/', (req,res) => {
    res
    .status(200)
    .json({success:true, message:`Create bootcamp`});
    console.log(req.params.id);
});

router.put('/:id', (req,res) => {
    console.log(req.params.id);
    res
    .status(200)
    .json({success:true, message:`Update bootcamp ${req.params.id}`});
    
});

router.delete('/:id', (req, res) => {
    res
    .status(200)
    .json({success:true, message:`Delete bootcamp ${req.params.id}`});
});*/