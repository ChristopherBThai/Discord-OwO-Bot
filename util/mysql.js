/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
const mysql = require('mysql');
const login = require('../../tokens/owo-login.json');

config = {
	host: "localhost",
	user: login.user,
	password: login.pass,
	database: "owo",
	supportBigNumbers: true,
	bigNumberStrings: true,
	multipleStatements: true,
	charset: "utf8mb4"
};

var pool = mysql.createPool(config);
pool.on('connection', function (connection) {
	  //console.log('New connect %d', connection.threadId);
});
/*
pool.on('acquire', function (connection) {
	  console.log('Connection %d acquired', connection.threadId);
});
pool.on('enqueue', function () {
	  console.log('Waiting for available connection slot');
});
pool.on('release', function (connection) {
	  console.log('Connection %d released', connection.threadId);
});
*/
/*
function handleDisconnect(){
	pool = mysql.createPool(config);

	con.connect(function(err){
		if(err) {
			console.log('Error connecting to mysql');
			setTimeout(handleDisconnect,2000);
		}else console.log("MySQL has connected");
	});

	con.on('error',function(err){
		console.error('db error',err);
		console.log(err.code);

		if(err.fatal){
			console.error('fatal');
			con.disconnect();
			handleDisconnect();
			return;
		}

		if(err.code !== 'PROTOCOL_CONNECTION_LOST'){
			throw err;
		}
		console.error("reconnection mysql");
		console.error(err);
		handleDisconnect();
	});

	module.exports.con = con;
}

function reconnect(){
	console.error("MYSQL IS GOING TO RECONNECT");
	console.log("MYSQL IS GOING TO RECONNECT");
	con.disconnect();
	handleDisconnect();
}
*/

exports.con = pool;
exports.mysql = mysql;
//exports.reconnect = reconnect;
//handleDisconnect();
//module.exports.reconnect = reconnect;
