/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

/***** Datadog *****/
var StatsD = require('node-dogstatsd').StatsD;
var log = new StatsD();

exports.increment = function (name, tags) {
	log.increment('owo.' + name, tags);
};

exports.decrement = function (name, tags) {
	log.decrement('owo.' + name, tags);
};

exports.value = function (name, amount, tags) {
	if (amount > 0) log.incrementBy('owo.' + name, amount, tags);
	else if (amount < 0) log.decrementBy('owo.' + name, Math.abs(amount), tags);
};

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
	socketTimeout: 5000,
});

const incr = (exports.incr = function (name, amount = 1, tags = {}, msg) {
	return;
	/* eslint-disable-next-line */
	if (amount < 0) {
		decr(name, amount, tags, msg);
		return;
	}
	if (msg) {
		tags.user = msg.author.id;
		tags.channel = msg.channel.id;
		tags.guild = msg.channel.type == 1 ? 'dm' : msg.channel.guild.id;
	}
	sdc.increment(`${name}`, amount, tags);
});

const decr = (exports.decr = function (name, amount = -1, tags = {}, msg) {
	return;
	/* eslint-disable-next-line */
	if (amount > 0) {
		incr(name, amount, tags, msg);
		return;
	}
	if (msg) {
		tags.user = msg.author.id;
		tags.channel = msg.channel.id;
		tags.guild = msg.channel.type == 1 ? 'dm' : msg.channel.guild.id;
	}
	sdc.decrement(`${name}`, amount, tags);
});

const request = require('request');
// Only display this error once per 5 minutes
let influxErrorShown = false;
setTimeout(() => {
	influxErrorShown = false;
}, 5 * 60 * 60 * 1000);
exports.command = function (command, msg) {
	const body = {
		password: process.env.INFLUXDB_PASS,
		command: command,
		user: msg.author.id,
	};

	request(
		{
			method: 'POST',
			uri: `${process.env.INFLUXDB_HOST}/command`,
			json: true,
			body: body,
		},
		function (err) {
			if (err && !influxErrorShown) {
				console.error('InfluxDB is inactive. Log upload will not work.');
				influxErrorShown = true;
				throw err;
			}
		}
	);
};

exports.logstash = function (command, p) {
	const body = {
		password: process.env.INFLUXDB_PASS,
		user: p.msg.author.id,
		command: command,
		text: p.msg.content,
		guild: p.msg.channel.guild.id,
	};

	request(
		{
			method: 'POST',
			uri: `${process.env.INFLUXDB_HOST}/metric`,
			json: true,
			body: body,
		},
		function (err) {
			if (err && !influxErrorShown) {
				console.error('InfluxDB is inactive. Log upload will not work.');
				influxErrorShown = true;
				throw err;
			}
		}
	);
};

exports.logstashBanned = function (command, p) {
	const body = {
		password: process.env.INFLUXDB_PASS,
		user: p.msg.author.id,
		bannedCommand: command,
		text: p.msg.content,
		guild: p.msg.channel.guild.id,
	};

	request(
		{
			method: 'POST',
			uri: `${process.env.INFLUXDB_HOST}/metric`,
			json: true,
			body: body,
		},
		function (err) {
			if (err && !influxErrorShown) {
				console.error('InfluxDB is inactive. Log upload will not work.');
				influxErrorShown = true;
				throw err;
			}
		}
	);
};

exports.logstashCaptcha = function (metric) {
	metric.password = process.env.INFLUXDB_PASS;

	request(
		{
			method: 'POST',
			uri: `${process.env.INFLUXDB_HOST}/captcha`,
			json: true,
			body: metric,
		},
		function (err) {
			if (err && !influxErrorShown) {
				console.error('InfluxDB is inactive. Log upload will not work.');
				influxErrorShown = true;
				throw err;
			}
		}
	);
};
