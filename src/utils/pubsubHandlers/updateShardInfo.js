/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

let cooldown = 3000;
let onCooldown = false;

const request = require('request');
const secret = require('../../../../tokens/wsserver.json');

exports.handle = async function(main, message){
	if(onCooldown) return;
	onCooldown = true;
	setTimeout(function(){ onCooldown = false; },cooldown);

	request({
		method:'POST',
		uri:secret.url+"/update-shard",
		json:true,
		body: fetchInfo(main),
	},function(err,res,body){
		if(err) {
			console.error(err);
			throw err;
		}
	});

}

function fetchInfo(main){
	let result = {password:secret.password};
	let shards = main.bot.shards;

	shards.forEach(function(val,key,map){
		result[val.id] = {
			"shard":val.id,
			"status":val.status,
			"ping":val.latency,
			"start":main.bot.uptime,
			"cluster":main.clusterID,
			"updatedOn":new Date()
		}
	});

	return result;
}
