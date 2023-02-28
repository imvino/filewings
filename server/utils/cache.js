const NodeCache = require('node-cache');
const User = require('../models/User');
const myCache = new NodeCache({ stdTTL: 1800 }); // 30m

async function cacheData(email) {
  if (myCache.has(email)) {
    //console.log('data read from memory');
    return myCache.get(email);
  } else {
    const user = await User.findOne({ email }).exec();
    myCache.set(email, user);
    // console.log('data read from db');
    return user;
  }
}

module.exports = { cacheData, myCache };
