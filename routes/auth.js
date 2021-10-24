const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const {register,login,userProfile,updateDetails,updatePassword,forgotPassword,resetPassword} = require('../controllers/auth');

router.route('/me').get(protect,userProfile);
router.route('/updatedetails').put(protect,updateDetails);
router.route('/updatepassword').put(protect,updatePassword);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);
module.exports = router;