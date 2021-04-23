/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
const mysql = require('mysql');
const login = require('../../../tokens/owo-login.json');

config = {
	host: login.mysql_host,
	user: login.mysql_user,
	password: login.mysql_pass,
	database: "owo",
	supportBigNumbers: true,
	multipleStatements: true,
	charset: "utf8mb4",
	connectionLimit: 10
};

const pool = mysql.createPool(config);
/*
pool.on('connection', function (connection) {
	  console.log('New connect ' + connection.threadId);
});
pool.on('acquire', function (connection) {
	  console.log('Connection acquired' + connection.threadId);
});
pool.on('enqueue', function () {
	  console.log('Waiting for available connection slot');
});
pool.on('release', function (connection) {
	  console.log('Connection released' + connection.threadId);
});
*/

exports.con = pool;
exports.mysql = mysql;
