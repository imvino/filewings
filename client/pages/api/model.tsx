var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fileSchema = new Schema({
    name: { type: String, required: true },
    private: { type: Boolean, required: true, default: true },
    key: { type: String, required: true, unique: true },
    url: { type: String, required: false },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const File = mongoose.model('File', fileSchema);

var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    blockUser: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

exports = { User, File };
