const mysql = require('../util/mysql.js');

exports.handle = function(err){
	console.log(err.code);
	switch(err.code){
		case "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR":
			mysql.reconnect();
			break;
	}
}
