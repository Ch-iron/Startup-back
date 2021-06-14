const express = require('express');
const mysql = require('mysql');
const connection = require('./model/mysql');
const admin = require('./model/firebase');
const stylist = require('./router/user/stylist');
const chat = require('./router/user/chat');
const mypage = require('./router/user/mypage');
const login = require('./router/user/login');
const fcm = require('./router/user/fcm');
const notice = require('./router/user/notice');
const supplier = require('./router/supplier/supplier');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/stylist', stylist);
app.use('/chat', chat);
app.use('/mypage', mypage);
app.use('/login', login);
app.use('/fcm', fcm);
app.use('/supplier', supplier);
app.use('/notice', notice);

app.listen(3000, () => {
	console.log('Server Start!!!');
});

module.exports = app;
