const express = require('express');
const router = express.Router({
    mergeParams: true
});

const {getCourses,createCourse,getCourse,updateCourse,deleteCourse} = require('../controllers/courses');
const advancedResult = require('../middleware/advancedResults');
const Course = require('../models/Course');
const {protect,authorize} = require('../middleware/auth');
router.route('/').get(advancedResult(Course,{
    path: 'bootcamp',
    select: 'name description'
}),getCourses).post(protect,authorize('publisher','admin'),createCourse);

//router.route('/').get(getCourses).post(createCourse);
router.route('/:id')
.get(getCourse)
.put(protect,authorize('publisher','admin'),updateCourse)
.delete(protect,authorize('publisher','admin'),deleteCourse);

module.exports = router;
