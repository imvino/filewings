var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  blockUser: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
