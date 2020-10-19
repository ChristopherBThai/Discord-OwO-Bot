/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const request = require('request');
const secret = require('../../tokens/wsserver.json');

exports.fetchInit = function(){
	return new Promise( (resolve, reject) => {
		request.get(secret.url+"/sharder-info/"+secret.server,function(err,res,body){
			if(err)
				reject(err);
			else if(res.statusCode==200)
				resolve(JSON.parse(body));
			else
				reject(res);
		});
	});
}

