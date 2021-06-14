const express = require('express');
const mysql = require('mysql');
const date = require('date-utils');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const connection = require('../../model/mysql');
const { upload_body, upload_request } = require('../../model/image_multer');
const router = express.Router();

let order1 = [8, 6, 7, 0, 4, 1, 3, 2, 5, 9];
let order1count = 0;
let order2 = [2, 7, 1, 6, 4, 0, 8, 9, 3, 5];
let order2count = 0;
let order3 = ['h', 'e', 'u', 'y', 'i', 'a', 'v', 'd', 'm', 't', 'o', 'f', 'l', 's', 'q', 'c', 'p', 'b', 'z', 'k', 'j', 'g', 'n', 'x', 'r', 'w'];
let order3count = 0;
let order4 = ['g', 'r', 'e', 'q', 'v', 'y', 'a', 'm', 'h', 'p', 'c', 'k', 'j', 'w', 'z', 'l', 'o', 'i', 't', 'f', 's', 'd', 'u', 'x', 'n', 'b'];
let order4count = 0;

//전신 사진 업로드
router.post('/image-upload-body', upload_body.array('image'), (req, res) => {
	console.log(req.files);
	console.log('Success');
});

//요청사항사진 업로드
router.post('/image-upload-request', upload_request.array('image'), (req, res) => {
	console.log(req.files);
	console.log('Success');
});

//메인화면에 뿌릴 전체 스타일리스트들의 정보 보내기
router.get('/stylist', (req, res) => {
	let page = parseInt(req.query.page);
	let sql = 'SELECT Stylist.stylist_id, user_id_for_stylist, nick_name, IFNULL(AVG(user_rating), 0) AS user_rating, COUNT(user_rating) AS count, profile_introduction, profile_description, profile_photo FROM Stylist LEFT JOIN Styling_Review on Stylist.stylist_id = Styling_Review.stylist_id GROUP BY Stylist.stylist_id order by Stylist.stylist_id limit ?, 10;';
	let numpage = [page];
	
	let sql1s = mysql.format(sql, numpage);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send(results);
	});
});

//설문에서 참고사진 스타일리스트 피드 가져올때 필요한 정보
router.get('/selected-stylist', (req, res) => {
	let sql = 'select nick_name, profile_introduction, profile_photo from Stylist where stylist_id = ?';
	let stylist_id = [req.query.stylist_id];

	let sql1s = mysql.format(sql, stylist_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send(results);
	});
});

//스타일리스트들의 피드사진들 가져오기
router.get('/stylist_feed', (req, res) => {
	//console.log(req.query.stylist_id);
	let sql1 = 'select stylist_id, feed_index, feed_photo, feed_description from Stylist_Feed where stylist_id = ?;';
	let stylist_id = [req.query.stylist_id];

	let sql1s = mysql.format(sql1, stylist_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send(results);
	});
});

//결제화면에서 해당 스타일리스트 정보 보여주기
router.get('/pay-stylist', (req, res) => {
	let sql1 = 'SELECT Stylist.stylist_id, user_id_for_stylist, nick_name, IFNULL(AVG(user_rating), 0) AS user_rating, COUNT(user_rating) AS count, profile_introduction, profile_description, profile_photo FROM Stylist LEFT JOIN Styling_Review on Stylist.stylist_id = Styling_Review.stylist_id GROUP BY Stylist.stylist_id having Stylist.stylist_id = ?;';
	let stylist_id = [req.query.stylist_id];

	let sql1s = mysql.format(sql1, stylist_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send(results);
	});
});

//해당 스타일리스트의 리뷰들 가져오기
router.get('/review', (req, res) => {
	let sql = 'SELECT Styling_Review.styling_id, tpo, Styling_Review.user_id, User.nick_name, Styling_Review.stylist_id, user_rating, user_photo, user_review_text, Styling_Review.timestamp FROM Styling_Review, User, Request WHERE Styling_Review.stylist_id = ? and Styling_Review.user_id = User.user_index AND Styling_Review.styling_id = Request.styling_id order by timestamp desc;';
	let stylist_id = [req.query.stylist_id];

	let sql1s = mysql.format(sql, stylist_id);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		res.send(results);
	});
});

//주문번호 생성
router.get('/ordernum', (req, res) => {
	let newDate = new Date();
    let ordertime = newDate.toFormat('YYMMDDHH24MI');
	console.log('test!!!!');
	let ordersql = 'select max(timestamp) as timestamp from Request;';
	connection.query(ordersql, (error, orderresults, fields) => {
		if (error) throw error;

	 	let prevorderdate = JSON.stringify(orderresults[0].timestamp).substr(3,8).split('-').join('');
		if (ordertime.substr(4,2) !== prevorderdate.substr(4,2)) {
			order1count = 0;
			order2count = 0;
			order3count = 0;
			order4count = 0;
		}
		let ordernum = ordertime + order1[order1count] + order2[order2count] + order3[order3count].toUpperCase() + order4[order4count].toUpperCase();
		if(order2count === order2.length - 1) {
			order1count++;
			if(order1count === order1.length){
				order1count = 0;
			}
		}
		if(order2count < order2.length - 1) {
			order2count++;
		}
		else{
			order2count = 0;
		}
		if(order4count === order4.length - 1) {
			order3count++;
			if(order3count === order3.length){
				order3count = 0;
			}
		}
		if(order4count < order4.length - 1) {
			order4count++;
		}
		else{
			order4count = 0;
		}
		res.send(ordernum);
	});
})

//설문 작성시에 Survey정보와 Request 정보 모두  DB에 저장하기
router.post('/requirement', (req, res, next) => {
	//console.log(time);
	//console.log(newDate.toFormat('YYYY-MM-DD HH24:MI:SS'));
	let sql1 = 'insert into Survey(user_id, shopping_preference, shopping_effort, trend_sensitive, job, working_fashion, height, weight, body_photo1, body_photo2, body_photo3, body_shape, size_top, feeling_top, size_waist, feeling_waist, size_outer, size_shoes, complex_top, complex_bottom, look_preference) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);'
	let survey = [req.body.request.user_id, req.body.survey.shopping_preference, req.body.survey.shopping_effort, req.body.survey.trend_sensitive, req.body.survey.job, req.body.survey.working_fashion, req.body.survey.height, req.body.survey.weight, req.body.survey.body_photo1, req.body.survey.body_photo2, req.body.survey.body_photo3, req.body.survey.body_shape, req.body.survey.size_top, req.body.survey.feeling_top, req.body.survey.size_waist, req.body.survey.feeling_waist, req.body.survey.size_outer, req.body.survey.size_shoes, req.body.survey.complex_top, req.body.survey.complex_bottom, req.body.survey.look_preference];
	let sql2 = 'update User set survey_check = 1 where user_index = ?;';
	let user_index = [req.body.request.user_id]

	let sql1s = mysql.format(sql1, survey);
	let sql2s = mysql.format(sql2, user_index);

	let sql3 = 'select max(survey_index) as survey_index from Survey where user_id = ?;';
	let sql3s = mysql.format(sql3, user_index);

	connection.query(sql1s + sql3s, (error, results) => {
		if(error) throw error;
		
		//주문번호와 저장된 Survey의 인덱스를 가져와서 Request에 같이 저장하기
		let sql4 = 'insert into Request(styling_id, user_id, stylist_id, survey_index, styling_state, wanted_fitting_top, wanted_fitting_bottom, need_outer, need_top, need_bottom, need_shoes, need_acc, tpo, budget_outer, budget_top, budget_bottom, budget_shoes, budget_acc, request_style, requirements) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);';
		let request = [req.body.request.ordernum, req.body.request.user_id, req.body.request.stylist_id, results[1][0].survey_index, 1, req.body.request.wanted_fitting_top, req.body.request.wanted_fitting_bottom, req.body.request.need_outer, req.body.request.need_top, req.body.request.need_bottom, req.body.request.need_shoes, req.body.request.need_acc, req.body.request.tpo, req.body.request.budget_outer, req.body.request.budget_top, req.body.request.budget_bottom, req.body.request.budget_shoes, req.body.request.budget_acc, req.body.request.request_style, req.body.request.requirements];
		let sql4s = mysql.format(sql4, request);
		connection.query(sql4s + sql2s, (error, secondresults) => {
			if(error) throw error;
			res.send('Success Requirement!!!');
			//console.log('Srccess Upload!!!! Second');
		});
	});
});

//결제 완료시에 Payment DB작성
router.post('/payment', (req, res, next) => {
	let sql1 = 'insert into Payment(styling_id, user_id, stylist_id, payment_price, payment_way) values(?,?,?,?,?);';
	let payment = [req.body.styling_id, req.body.user_id, req.body.stylist_id, req.body.payment_price, req.body.payment_way];

	let sql1s = mysql.format(sql1, payment);
	connection.query(sql1s, (error, results) => {
		if (error) throw error;
		res.send('Payment Success Upload!!!');
	});
});

//채팅방 DB에 생성하기
router.post('/chatroom', (req, res, next) => {
	let sql1 = 'insert into Chatroom(styling_id, user_id, user_id2) values(?,?,?);';
	let sql2 = 'insert into Chatroom(styling_id, user_id, user_id2) values(?,?,?);';
	let room1 = [req.body.styling_id, req.body.user_id1, req.body.user_id2];
	let room2 = [req.body.styling_id, req.body.user_id2, req.body.user_id1];

	let sql1s = mysql.format(sql1, room1);
	let sql2s = mysql.format(sql2, room2);

	let sql3 = 'insert into Chatmessage(chat_index, chat_text, send_id, message_type) values(?,?,?,?,?)';
	let require_message = [req.body.styling_id, '요청서 접수 완료!', req.body.user_id1, 'system'];

	let sql3s = mysql.format(sql3, require_message);
	connection.query(sql1s + sql2s + sql3s, (error, results) => {
		if (error) throw error;
		res.send('Create ChatRoom Success!!');
	});
});

module.exports = router;
