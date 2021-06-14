const express = require('express');
const mysql = require('mysql');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const connection = require('../../model/mysql');
const router = express.Router();
const { upload_user_profile, upload_review } = require('../../model/image_multer');

//유저 프로필 사진 업로드
router.post('/image-upload-user-profile', upload_user_profile.array('image'), (req, res) => {
	console.log(req.files);
	res.send('Success');
});

//리뷰 사진 업로드
router.post('/image-upload-review', upload_review.array('image'), (req, res) => {
	console.log(req.files);
	res.send('Success');
});

//유저 프로필 사진 url 업데이트
router.post('/update-user-profile', (req, res, next) => {
	console.log(req.body);
	let sql = 'UPDATE User SET user_profile_photo = ? WHERE user_index = ?;';
	let user_profile = [req.body.user_profile_photo, req.body.user_index];

	let sql1s = mysql.format(sql, user_profile);
	connection.query(sql1s, (error, results, fields) => {
		if (error) throw error;
		console.log('Success!!!');
		res.send('Success!!!');
	});
});

//리뷰 작성
router.post('/review', (req, res, next) => {
	console.log(req.body);
	let sql1 = 'insert into Styling_Review(styling_id, user_id, stylist_id, user_rating, user_photo, user_review_text) values(?,?,?,?,?,?);';
	let review = [req.body.styling_id, req.body.user_id, req.body.stylist_id, req.body.user_rating, req.body.user_photo, req.body.user_review_text];
	let sql2 = 'UPDATE Request SET review_write = 1 WHERE styling_id = ?;';
	let styling_id = [req.body.styling_id];

	let sql1s = mysql.format(sql1, review);
	let sql2s = mysql.format(sql2, styling_id);
	connection.query(sql1s + sql2s, (error, results) => {
		if(error) throw error;
		res.send('Upload Success!');
	});
});

//요청서, 제안서, 결제내역 갯수 가져오기
router.get('/requirement-suggestion-billing-count', (req, res) => {
	let sql1 = 'SELECT COUNT(*) AS suggestion_count FROM Suggestion WHERE user_id = ?;';
	let sql2 = 'SELECT COUNT(*) AS payment_count FROM Payment WHERE user_id = ?;';
	let sql3 = 'SELECT COUNT(*) AS requirement_count FROM Request WHERE user_id = ?;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	let sql2s = mysql.format(sql2, user_id);
	let sql3s = mysql.format(sql3, user_id);
	connection.query(sql1s + sql2s + sql3s, (error, results) => {
		res.send(results);
	});
});

//유저에 해당하는 요청서 모두 가져오기
router.get('/requirement', (req, res) => {
	let sql = 'SELECT Request.survey_index, Request.styling_id, Request.user_id, Request.timestamp, Request.stylist_id, nick_name, profile_introduction, profile_photo, styling_state, shopping_preference, shopping_effort, trend_sensitive, job, working_fashion, height, weight, body_photo1, body_photo2, body_photo3, body_shape, size_top, feeling_top, size_waist, feeling_waist, size_outer, size_shoes, complex_top, complex_bottom, look_preference, wanted_fitting_top, wanted_fitting_bottom, need_outer, need_top, need_bottom, need_shoes, need_acc, tpo, budget_outer, budget_top, budget_bottom, budget_shoes, budget_acc, request_style, requirements FROM Survey, Request, Stylist WHERE Request.user_id = ? AND Request.survey_index = Survey.survey_index and Request.stylist_id = Stylist.stylist_id order by timestamp desc;';
	let user_id = [req.query.user_id];
	
	let sql1s = mysql.format(sql, user_id);
	connection.query(sql1s, (error, results) => {
		res.send(results);
	});
});

//제안서에서 요청서로 넘어갈때 요청서 정보 가져오기
router.get('/suggestion-requirement', (req, res) => {
	let sql = 'SELECT nick_name, profile_introduction, profile_photo, styling_state, shopping_preference, shopping_effort, trend_sensitive, job, working_fashion, height, weight, body_photo1, body_photo2, body_photo3, body_shape, size_top, feeling_top, size_waist, feeling_waist, size_outer, size_shoes, complex_top, complex_bottom, look_preference, wanted_fitting_top, wanted_fitting_bottom, need_outer, need_top, need_bottom, need_shoes, need_acc, tpo, budget_outer, budget_top, budget_bottom, budget_shoes, budget_acc, request_style, requirements FROM Survey, Request, Stylist WHERE Request.survey_index = Survey.survey_index and Request.stylist_id = Stylist.stylist_id AND Request.styling_id = ?';
	let styling_id = [req.query.styling_id];
	
	let sql1s = mysql.format(sql, styling_id);
	connection.query(sql1s, (error, results) => {
		res.send(results);
	});
});

//유저에 해당하는 제안서 모두 가져오기
router.get('/suggestion', (req, res) => {
	let sql1 = 'SELECT Request.tpo, Suggestion.styling_id, Suggestion.user_id, Suggestion.stylist_id, time_stamp, Suggestion.description, nick_name, profile_introduction, profile_photo FROM Request, Suggestion, Stylist WHERE Request.styling_id = Suggestion.styling_id and Suggestion.user_id = ? AND Suggestion.stylist_id = Stylist.stylist_id;';
	let user_id = [req.query.user_id];
	
	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		res.send(results);
	});
});

//해당 요청서에 맞는 제안서가 있는지 탐색
router.get('/isexist-suggestion', (req, res) => {
	let sql = 'SELECT EXISTS (SELECT * FROM Suggestion WHERE styling_id = ?) AS isExist;'
	let styling_id = [req.query.styling_id];

	let sql1s = mysql.format(sql, styling_id);

	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send(results);
	})
});

//요청서에서 해당하는 제안서 가져오기
router.get('/requirement-suggestion', (req, res) => {
	console.log(req.query);
	let sql1 = 'SELECT Suggestion.description, nick_name, profile_photo FROM Request, Suggestion, Stylist WHERE Request.styling_id = Suggestion.styling_id and Suggestion.styling_id = ? AND Suggestion.stylist_id = Stylist.stylist_id;';
	let sql2 = 'SELECT styling_id, styling_index, item_index, big_category, text_category, brand, product_name, product_photo, color, price, size, link, description FROM Product WHERE styling_id = ? AND styling_index = 1 ORDER BY styling_index, big_category, small_category;';
	let sql3 = 'SELECT styling_id, styling_index, item_index, big_category, text_category, brand, product_name, product_photo, color, price, size, link, description FROM Product WHERE styling_id = ? AND styling_index = 2 ORDER BY styling_index, big_category, small_category;';
	let styling_id = [req.query.styling_id];

	let sql1s = mysql.format(sql1, styling_id);
	let sql2s = mysql.format(sql2, styling_id);
	let sql3s = mysql.format(sql3, styling_id);
	connection.query(sql1s + sql2s + sql3s, (error, results) => {
		console.log(results);
		res.send(results);
	});
});

//제안서에 해당하는 제품 모두 가져오기
router.get('/products', (req, res) => {
	let sql1 = 'SELECT styling_id, styling_index, item_index, big_category, text_category, brand, product_name, product_photo, color, price, size, link, description FROM Product WHERE styling_id = ? AND styling_index = 1 ORDER BY styling_index, big_category, small_category;';
	let sql2 = 'SELECT styling_id, styling_index, item_index, big_category, text_category, brand, product_name, product_photo, color, price, size, link, description FROM Product WHERE styling_id = ? AND styling_index = 2 ORDER BY styling_index, big_category, small_category;';
	let styling_id = [req.query.styling_id];

	let sql1s = mysql.format(sql1, styling_id);
	let sql2s = mysql.format(sql2, styling_id);
	connection.query(sql1s + sql2s, (error, results) => {
		res.send(results);
	});
	
});

//유저에 해당하는 결제내역 모두 가져오기
router.get('/billing', (req, res) => {
	let sql1 = 'SELECT Payment.styling_id, Payment.user_id, Payment.stylist_id, nick_name, styling_state, Request.tpo, timestamp, payment_price, payment_way, review_write FROM Request, Payment, Stylist WHERE Payment.user_id = ? AND Request.styling_id = Payment.styling_id AND Request.stylist_id = Stylist.stylist_id;';
	let user_id = [req.query.user_id];

	let sql1s = mysql.format(sql1, user_id);
	connection.query(sql1s, (error, results) => {
		res.send(results);
	});
});

//주문취소
router.post('/order-cancel', (req, res, next) => {
	let sql = 'UPDATE Request SET styling_state = 4 WHERE styling_id = ?';
	let styling_id = [req.body.styling_id];
	
	let sql1s = mysql.format(sql, styling_id);
	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send('status Update!!!!');
		console.log('test');
	});
});

//개인정보 수정하면 수정한 정보 저장하기
router.post('/information', (req, res, next) => {
	console.log(req.body);
	let sql1 = 'insert into Survey(user_id, shopping_preference, shopping_effort, trend_sensitive, job, working_fashion, height, weight, body_photo1, body_photo2, body_photo3, body_shape, size_top, feeling_top, size_waist, feeling_waist, size_outer, size_shoes, complex_top, complex_bottom, look_preference) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);'
	let survey = [req.body.user_id, req.body.shopping_preference, req.body.shopping_effort, req.body.trend_sensitive, req.body.job, req.body.working_fashion, req.body.height, req.body.weight, req.body.body_photo1, req.body.body_photo2, req.body.body_photo3, req.body.body_shape, req.body.size_top, req.body.feeling_top, req.body.size_waist, req.body.feeling_waist, req.body.size_outer, req.body.size_shoes, req.body.complex_top, req.body.complex_bottom, req.body.look_preference];
	let sql1s = mysql.format(sql1, survey);

	connection.query(sql1s, (error, results) => {
		if(error) throw error;
		res.send('Information Upload Success!!!!!');
	});
});

module.exports = router;
