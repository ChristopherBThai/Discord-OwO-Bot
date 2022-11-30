/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const request = require('request');
const { SHARDER_HOST, SHARDER_PASS } = process.env;
const cooldown = 3000;
const onCooldown = false;

exports.handle = async function(main) {
	if (onCooldown) return;
	onCooldown = true;
	setTimeout(function() { 
		onCooldown = false; 
	},cooldown);
	request({
		method: 'POST',
		uri: SHARDER_HOST + '/update-shard',
		json: true,
		body: fetchInfo(main)
	}, function(err) {
		if (err) {
			console.error(err);
			throw err;
		}
	});
};

function fetchInfo(main) {
	let result = { password: SHARDER_PASS };
	let shards = main.bot.shards;
	shards.forEach(function(val) {
		result[val.id] = {
			'shard': val.id,
			'status': val.status,
			'ping': val.latency,
			'start': main.bot.uptime,
			'cluster': main.clusterID,
			'updatedOn': new Date()
		}
	});
	return result;
};
