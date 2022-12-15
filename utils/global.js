/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const { REDIS_HOST, REDIS_PASS } = process.env;
const pub = require('redis').createClient({
  host: REDIS_HOST,
  password: REDIS_PASS
});
	
exports.resetBot = async function() {
	pub.publish('endProcess', true);
};
