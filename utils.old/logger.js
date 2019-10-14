/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
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
