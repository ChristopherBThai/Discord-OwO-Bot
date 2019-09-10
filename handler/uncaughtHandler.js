/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const mysql = require('../util/mysql.js');
const logger = require('../util/logger.js');

exports.handle = function(err,type,client){
	if(err.name=='DiscordAPIError'){
		handleDiscordAPIError(err,type);
	}else{
		console.error(type+" at Shard "+client.shard.ids[0]+" error "+(new Date()).toLocaleString());
		console.error(err);
	}
}

function handleDiscordAPIError(err,type){
	logger.increment("error",["type:"+type,"code:"+err.code,"httpStatus:"+err.httpStatus]);
}
