const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

const verifyGoogleToken = async (res, authorization) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: authorization.includes('Bearer')
        ? authorization.split(' ')[1]
        : authorization,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    console.error('Error verifying Google access token:', error);
    return res.status(401).json({ message: 'UNAUTHORIZED_REQUEST' });
  }
};

module.exports = verifyGoogleToken;
