const express = require('express');
const mysql = require('mysql');
const connection = require('../../model/mysql');
const router = express.Router();

//유저의 survey 내용 불러오기
router.get('/survey', (req, res) => {
	let sql1 = 'SELECT * FROM Survey WHERE user_id = ? ORDER BY survey_index DESC LIMIT 1;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		res.send(results);
	});
});

//회원가입하여 유저정보 DB에 저장하기
router.post('/login', (req, res, next) => {
	console.log(req.body);
	let sql = 'insert into User(user_id, name, nick_name, phone_number, email, gender, birth, survey_check, login_state, login_type, login_token, user_profile_photo) values(?,?,?,?,?,?,?,?,?,?,?,?);'
	let info = [req.body.info.user_id, req.body.info.name, req.body.info.nick_name, req.body.info.phone_number, req.body.info.email, req.body.info.gender, req.body.info.birth, req.body.info.survey_check, req.body.info.login_state, req.body.info.login_type, req.body.info.login_token, req.body.info.user_profile_photo]
	
	let sql1s = mysql.format(sql, info);

	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send('Login Success!!!!!');
		console.log('Login Success!!!!!');
	})
});

//user_id가 존재하는지 파악하여 첫 로그인인지 판별하기
router.get('/first-login', (req, res) => {
	let sql = 'select exists (select * from User where user_id = ?) as isFirst;'
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql, user_id);

	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send(results);
	})
});

//DB에서 저장되어있는 유저정보 가져오기
router.get('/getprofile', (req, res) => {
	let sql = 'select * from User where user_id = ?;'
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql, user_id);

	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send(results);
	})
});

module.exports = router;
