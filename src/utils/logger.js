/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
/***** Datadog *****/
var StatsD = require('node-dogstatsd').StatsD;
var log = new StatsD();

exports.increment= function(name,tags){
	log.increment('owo.'+name,tags);
}

exports.decrement= function(name,tags){
	log.decrement('owo.'+name,tags);
}

exports.value = function(name,amount,tags){
	if(amount>0)
		log.incrementBy('owo.'+name,amount,tags);
	else if(amount<0)
		log.decrementBy('owo.'+name,Math.abs(amount),tags);
}

/***** winston *****/
/*
const winston = require('winston');
const logger = winston.createLogger({
	level:'verbose',
	transports:[new winston.transports.File({filename:'combined.log'})]
});

winstonLogger = {
	error:function(msg){msg.time=new Date();logger.error(msg)},
	warn:function(msg){msg.time=new Date();logger.warn(msg)},
	info:function(msg){msg.time=new Date();logger.info(msg)},
	verbose:function(msg){msg.time=new Date();logger.verbose(msg)},
	debug:function(msg){msg.time=new Date();logger.debug(msg)},
}

exports.log = winstonLogger;
*/

/***** StatsD *****/
const SDC = require('statsd-client');
const sdc = new SDC({
	host: 'localhost',
	port: 9125,
	prefix: 'owo',
	socketTimeout: 5000
});
const influxdb = require('../../../tokens/influxdb.json');

const incr = exports.incr = function (name, amount=1, tags={}, msg) {
	return;
	if (amount < 0) {
		decr(name, amount, tags, msg);
		return;
	}
	if (msg) {
		tags.user = msg.author.id;
		tags.channel = msg.channel.id;
		tags.guild = msg.channel.type==1 ? 'dm' : msg.channel.guild.id;
	}
	sdc.increment(`${name}`, amount, tags);
}

const decr = exports.decr = function (name, amount=-1, tags={}, msg) {
	return;
	if (amount > 0) {
		incr(name, amount, tags, msg);
		return;
	}
	if (msg) {
		tags.user = msg.author.id;
		tags.channel = msg.channel.id;
		tags.guild = msg.channel.type==1 ? 'dm' : msg.channel.guild.id;
	}
	sdc.decrement(`${name}`, amount, tags);
}

const request = require('request');
exports.command = function(command, msg) {
	const body = {
		password: influxdb.password,
		command: command,
		user: msg.author.id
	}

	request({
		method:'POST',
		uri:`${influxdb.url}/command`,
		json:true,
		body: body,
	},function(err,res,body){
		if(err) {
			console.error(err);
			throw err;
		}
	});

}
