const express = require('express');
const mysql = require('mysql');
const connection = require('../../model/mysql');
const router = express.Router();

//공지사항 가져오기
router.get('/', (req, res) => {
	let sql = 'select * from notice;';
	
	connection.query(sql, (error, results) => {
		res.send(results);
	});
});

module.exports = router;
