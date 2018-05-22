const mysql = require('mysql');
const login = require('../../tokens/owo-login.json');

var con = mysql.createConnection({
	host: "localhost",
	user: login.user,
	password: login.pass,
	database: "owo",
	supportBigNumbers: true,
	bigNumberStrings: true,
	multipleStatements: true,
	charset: "utf8mb4"
});

con.connect(function(err){
	if(err) throw err;
	console.log("MySQL has connected");
});

exports.con = con;
exports.mysql = mysql;
