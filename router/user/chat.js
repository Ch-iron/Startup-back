const express = require('express');
const mysql = require('mysql');
const connection = require('../../model/mysql');
const { upload_chat_image } = require('../../model/image_multer');
const router = express.Router();
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

//채팅 이미지 S3로 전송, DB에 메시지 저장
router.post('/image-upload-chat', upload_chat_image.array('image'), (req, res) => {
	console.log(req.files);
	res.send('Success!!');
});

//채팅방 리스트 생성할 데이터 가져오기
router.get('/chatlist', (req, res) => {
	let sql1 = 'select styling_id, user_id, user_id2, is_read, is_end, nick_name, user_profile_photo, text_index, chat_text, timestamp, message_type from (select styling_id, Chatroom.user_id, user_id2, is_read, is_end, nick_name, user_profile_photo from Chatroom, User where Chatroom.user_id = ? and user_id2 = User.user_index) as room, (select chat_index, text_index, chat_text, timestamp, message_type from Chatmessage, (select max(text_index) as max_index from Chatmessage group by chat_index) as last_index where text_index = max_index) as last_message where room.styling_id = last_message.chat_index order by text_index desc;';
	let sql2 = 'SELECT EXISTS (SELECT * FROM Chatroom WHERE user_id = ? AND is_read = 1) AS isread_exist;';
	
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	let sql2s = mysql.format(sql2, user_id);
	connection.query(sql1s + sql2s, (error, results) => {
		if(error) throw error;
		res.send(results);
	});
});

//채팅방 채팅메시지 데이터 가져오기
router.get('/chat-message', (req, res) => {
	let sql = 'select * from Chatmessage where chat_index = ?;';
	let styling_id = [req.query.styling_id];

	let sql1s = mysql.format(sql, styling_id);
	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send(results);
	});
});

//채팅메시지 DB로 전송
router.post('/chat-message', (req, res, next) => {
	let sql1 = 'insert into Chatmessage(chat_index, chat_text, send_id, message_type) values (?,?,?,?,?);';
	let message = [req.body.chat_index, req.body.chat_text, req.body.send_id, req.body.message_type];

	let sql2 = 'SELECT * FROM Chatmessage WHERE chat_index = ? ORDER BY text_index DESC LIMIT 1;';
	let styling_id = [req.body.chat_index];

	let sql1s = mysql.format(sql1, message);
	let sql2s = mysql.format(sql2, styling_id);
	connection.query(sql1s, (error, results) => {
		if (error) throw error;
		//res.send('Upload Message Success!!');
		connection.query(sql2s, (error, message) => {
			console.log(message);
			res.send('Send Message Success!!');
			io.sockets.in(req.body.chat_index).emit('new message', message);
		});
	});
});


//상담 종료되었다고 체크하기
router.get('/update-isend', (req, res) => {
	let sql = 'update Chatroom set is_end = 1 where styling_id = ?;';
	let styling_id = [req.query.styling_id];

	let sql1s = mysql.format(sql, styling_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send('Update is_end Success!!!');
	});
});

//채팅 모두 읽음을 표시하기
router.get('/update-isread', (req, res) => {
	let sql = 'update Chatroom set is_read = 1 where styling_id = ? and user_id = ?;';
	let styling_id = [req.query.styling_id, req.query.user_id];

	let sql1s = mysql.format(sql, styling_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send('Update is_read Success!!!');
	});
});

//채팅창에서 바로 리뷰창으로 넘어가기 위해 필요한 정보 가져오기
router.get('/chat-review', (req, res) => {
	console.log(req.query);
	let sql = 'SELECT * FROM (SELECT Payment.styling_id, Payment.user_id, Payment.stylist_id, nick_name, styling_state, Request.tpo, timestamp, payment_price, payment_way, review_write FROM Request, Suggestion, Payment, Stylist WHERE Payment.user_id = ? AND Request.styling_id = Payment.styling_id AND Request.stylist_id = Stylist.stylist_id AND Request.styling_id = Suggestion.styling_id) AS styling WHERE styling.styling_id = ?;';
	let styling_id = [req.query.user_id, req.query.styling_id];

	let sql1s = mysql.format(sql, styling_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		console.log(results);
		res.send(results);
	});
});

//첫 시작시에 안읽은 채팅이 있는지를 확인하여 bottomtab에표시하기 위해 사용
router.get('/isread-exist', (req, res) => {
	let sql1 = 'SELECT EXISTS (SELECT * FROM Chatroom WHERE user_id = ? AND is_read = 1) AS isread_exist;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send(results);
	});

});

module.exports = router;
