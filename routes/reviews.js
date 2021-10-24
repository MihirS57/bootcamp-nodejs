const express = require('express');
const reviews = require('../controllers/reviews');
const Review = require('../models/Review');
const advancedResult = require('../middleware/advancedResults');
const router = express.Router({
    mergeParams: true
});
const {protect,authorize} = require('../middleware/auth');
const {getReviews,getReview,postReview} = require('../controllers/reviews');

router.route('/').get(advancedResult(Review,{
    path: 'bootcamp',
    select: 'name description'
}),getReviews);

router.route('/:id').get(getReview);

router.route('/').post(protect,authorize('publisher','user'),postReview);

module.exports = router;