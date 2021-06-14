const express = require('express');
const mysql = require('mysql');
const connection = require('../../model/mysql');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const admin = require('../../model/firebase');
const router = express.Router();



router.get('/', (req, res) => {
	res.send('test');
});

module.exports = router;
