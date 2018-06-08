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

var con;
function handleDisconnect(){
	con = mysql.createConnection(config);

	con.connect(function(err){
		if(err) {
			console.log('Error connecting to mysql');
			setTimeout(handleDisconnect,2000);
		}else console.log("MySQL has connected");
	});

	con.on('error',function(err){
		console.error('db error',err);
		if(err.code = 'PROTOCOL_CONNECTION_LOST'){
			handleDisconnect();
		}
	});

	module.exports.con = con;
}

exports.con = con;
exports.mysql = mysql;

handleDisconnect();

