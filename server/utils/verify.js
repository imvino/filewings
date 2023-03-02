const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

const verifyGoogleToken = async (req, res, next) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.headers.authorization.includes('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : req.headers.authorization,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.user = payload; // add the user information to the request object
    next(); // call the next middleware
  } catch (error) {
    console.error('Error verifying Google access token:', error);
    return res.status(401).json({ message: 'UNAUTHORIZED_REQUEST' });
  }
};

module.exports = verifyGoogleToken;
