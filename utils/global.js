/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
const login = require('../../tokens/owo-login.json');
const pub = require('redis').createClient({
  host: login.redis_host,
  password: login.redis_pass
});
	
exports.resetBot = async function(){
	pub.publish("endProcess",true);
}
