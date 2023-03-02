const express = require('express');
const router = express.Router();
const { userLogin } = require('../controller/userCtrl');
const verifyGoogleToken = require('../utils/verify');

router.route('/signin').post(verifyGoogleToken, userLogin);

module.exports = router;
