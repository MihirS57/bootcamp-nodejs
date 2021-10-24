const express = require('express');
const router = express.Router();
const User = require('../models/User')
const advancedResult = require('../middleware/advancedResults');
const {protect,authorize} = require('../middleware/auth');
const {getUsers,getUser,createUsers,updateUser,deleteUser} = require('../controllers/users');

router.route('/')
.get(protect, authorize('admin'),advancedResult(User),getUsers)
.post(protect, authorize('admin'),createUsers);

router.route('/:id')
.get( protect, authorize('admin'), advancedResult(User),getUser)
.put(protect, authorize('admin'),updateUser)
.delete(protect, authorize('admin'),deleteUser);

/*
instead of applying protect and authorize in each, we can use
router.use(protect)
router.use(authorize('admin))
*/

module.exports = router;