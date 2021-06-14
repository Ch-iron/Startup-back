const express = require('express');
const mysql = require('mysql');
const admin = require('../../model/firebase');
const connection = require('../../model/mysql');
const router = express.Router();

//FCMtoken DB에 저장하기
router.post('/upload-fcmtoken', (req, res, next) => {
	let sql1 = 'select exists (select * from FCMtoken where chat_token = ?) as token_exist;';
	let isexist = [req.body.chat_token];

	let sql2 = 'insert into FCMtoken values(?,?);';
	let token = [req.body.user_id, req.body.chat_token];

	let sql1s = mysql.format(sql1, isexist);
	let sql2s = mysql.format(sql2, token);
	connection.query(sql1s, (error, results) => {
		if (error) throw error;
		if(results[0].token_exist === 1){
			res.send('Token Exist!!!');
		}
		else{
			connection.query(sql2s, (error, tokenresults) => {
				if(error) throw error;
				res.send('Upload FCMtoken Success!!!');
			});	
		}
	});
});

//FCMtoken DB에서 가져와서 요청서 도착 알림 보내기
router.get('/push-notification-requirement', (req, res) => {
	let chat_tokens = [];
	let sql1 = 'select * from FCMtoken where user_id = ?;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		if (error) throw error;
		results.map((token) => {
			chat_tokens.push(token.chat_token);
			console.log(chat_tokens);
		});
		admin.messaging().sendMulticast({
			tokens: chat_tokens,
			notification: {
				title: '요청서',
				body: '요청서가 도착했어요!',
			},
		});
		res.send('Success Send Requirement!!!!');
	});
});

//FCMtoken DB에서 가져와서 제안서 도착 알림 보내기
router.get('/push-notification-suggestion', (req, res) => {
	let chat_tokens = [];
	let sql1 = 'select * from FCMtoken where user_id = ?;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		if (error) throw error;
		results.map((token) => {
			chat_tokens.push(token.chat_token);
			console.log(chat_tokens);
		});
		admin.messaging().sendMulticast({
			tokens: chat_tokens,
			notification: {
				title: '제안서',
				body: '제안서가 도착했어요!',
			},
		});
		res.send('Success Send Suggestion!!!!');
	});
});


//FCMtoken DB에서 가져와서 채팅 도착 알림 보내기
router.get('/push-notification-chat', (req, res) => {
	let chat_tokens = [];
	let sql1 = 'select * from FCMtoken where user_id = ?;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		if (error) throw error;
		results.map((token) => {
			chat_tokens.push(token.chat_token);
			console.log(chat_tokens);
		});
		admin.messaging().sendMulticast({
			tokens: chat_tokens,
			notification: {
				title: req.query.nick_name,
				body: req.query.chat_text,
			},
		});
		res.send('Success Send Chat!!!!');
	});
});

module.exports = router;
