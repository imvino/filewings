const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyGoogleToken = require('../utils/verify');
const { cacheData, myCache } = require('../utils/cache');

router.route('/signin').post(async (req, res, next) => {
  let result = await verifyGoogleToken(res, req.headers?.authorization);
  if (result?.email) {
    try {
      const { name, email, picture } = result;
      const user = await User.findOneAndUpdate(
        { email },
        { name, email, image: picture, lastLoginAt: Date.now() },
        { new: true, upsert: true }
      ).exec();

      if (user) {
        //cache userInfo till expire
        myCache.set(user.email, user);
      }

      res.status(200).json({ status: 'Logged in' });
    } catch (error) {
      res.status(403).json({ status: 'Db error' });
    }
  }
});

module.exports = router;
