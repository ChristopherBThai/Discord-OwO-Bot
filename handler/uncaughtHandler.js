/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const mysql = require('../util/mysql.js');

exports.handle = function(err){
	console.log(err.code);
	switch(err.code){
		case "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR":
			//mysql.reconnect();
			break;
	}
}
