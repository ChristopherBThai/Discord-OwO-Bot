/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
/***** Datadog *****/
/*
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
*/

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
	socketTImeout: 5000,
	stats: {
		"server": 1
	}
});

const incr = exports.incr = function (name, amount=1, msg) {
	if (amount < 0) {
		decr(name, amount, msg);
		return;
	}
	if (msg) {
		if (msg.channel.type==1) {
			sdc.increment(`${name}.dm.${msg.channel.id}.${msg.author.id}`, amount);
		} else {
			sdc.increment(`${name}.${msg.channel.guild.id}.${msg.channel.id}.${msg.author.id}`, amount);
		}
	} else {
		sdc.increment(`${name}`, amount);
	}
}

const decr = exports.decr = function (name, amount=-1, msg) {
	if (amount > 0) {
		incr(name, amount, msg);
		return;
	}
	if (msg) {
		if (msg.channel.type==1) {
			sdc.decrement(`${name}.dm.${msg.channel.id}.${msg.author.id}`, amount);
		} else {
			sdc.decrement(`${name}.${msg.channel.guild.id}.${msg.channel.id}.${msg.author.id}`, amount);
		}
	} else {
		sdc.decrement(`${name}`, amount);
	}
}
