//Packages
const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyGoogleToken = require('../utils/verify');
const { deleteFile, uploadFile, listFile } = require('../controller/fileCtrl');

// Send from memory without saving in server
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ROUTES
router.route('/list').post(verifyGoogleToken, listFile);

router.route('/delete').post(verifyGoogleToken, deleteFile);

router
  .route('/upload')
  .post(verifyGoogleToken, upload.single('file'), uploadFile);

module.exports = router;
