const { myCache } = require('../utils/cache');
const User = require('../models/User');

exports.userLogin = async (req, res) => {
  try {
    const { name, email, picture } = req.user;
    // Find or create user based on email
    const user = await User.findOneAndUpdate(
      { email },
      { name, email, image: picture, lastLoginAt: Date.now() },
      { new: true, upsert: true }
    ).exec();

    if (user) {
      // Cache user info until it expires
      myCache.set(user.email, user);
    }
    // Send response
    res.status(200).json({ status: 'LOGIN_SUCCESS' });
  } catch (error) {
    // Handle server error
    console.error(error);
    return res.status(500).json({ message: 'SERVER_ERROR' });
  }
};
