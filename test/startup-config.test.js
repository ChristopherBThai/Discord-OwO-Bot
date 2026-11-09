const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const redisOptions = require('../utils/redisOptions.js');

test('Redis omits AUTH when the password is empty or absent', () => {
	const oldHost = process.env.REDIS_HOST;
	const oldPassword = process.env.REDIS_PASS;
	try {
		process.env.REDIS_HOST = 'localhost';
		process.env.REDIS_PASS = '';
		assert.deepEqual(redisOptions(), { host: 'localhost' });
		delete process.env.REDIS_PASS;
		assert.deepEqual(redisOptions(), { host: 'localhost' });
		process.env.REDIS_PASS = 'example';
		assert.deepEqual(redisOptions(), { host: 'localhost', password: 'example' });
	} finally {
		if (oldHost === undefined) delete process.env.REDIS_HOST;
		else process.env.REDIS_HOST = oldHost;
		if (oldPassword === undefined) delete process.env.REDIS_PASS;
		else process.env.REDIS_PASS = oldPassword;
	}
});

test('rate-limit logging is disabled without an InfluxDB host', () => {
	const originalLoad = Module._load;
	const oldHost = process.env.INFLUXDB_HOST;
	const oldInterval = global.setInterval;
	const oldWarn = console.warn;
	let requests = 0;
	let intervals = 0;
	try {
		delete process.env.INFLUXDB_HOST;
		Module._load = function (request, ...args) {
			if (request === 'request') return () => requests++;
			return originalLoad.call(this, request, ...args);
		};
		global.setInterval = () => intervals++;
		console.warn = () => {};
		const rateLimit = require('../utils/rateLimitUtil.js');
		rateLimit.init({}, false);
		assert.equal(requests, 0);
		assert.equal(intervals, 0);
	} finally {
		Module._load = originalLoad;
		global.setInterval = oldInterval;
		console.warn = oldWarn;
		if (oldHost === undefined) delete process.env.INFLUXDB_HOST;
		else process.env.INFLUXDB_HOST = oldHost;
	}
});

test('configured rate-limit logging reports request failures without throwing', () => {
	const originalLoad = Module._load;
	const oldHost = process.env.INFLUXDB_HOST;
	const oldInterval = global.setInterval;
	const oldError = console.error;
	const modulePath = require.resolve('../utils/rateLimitUtil.js');
	let callback;
	let logged = false;
	try {
		delete require.cache[modulePath];
		process.env.INFLUXDB_HOST = 'http://localhost:1234';
		Module._load = function (request, ...args) {
			if (request === 'request') {
				return (_options, done) => done(new Error('connection refused'));
			}
			return originalLoad.call(this, request, ...args);
		};
		global.setInterval = (fn) => {
			callback = fn;
		};
		console.error = () => {
			logged = true;
		};
		const rateLimit = require('../utils/rateLimitUtil.js');
		rateLimit.init({ getState: () => ({}) }, false);
		callback();
		assert.equal(logged, true);
	} finally {
		delete require.cache[modulePath];
		Module._load = originalLoad;
		global.setInterval = oldInterval;
		console.error = oldError;
		if (oldHost === undefined) delete process.env.INFLUXDB_HOST;
		else process.env.INFLUXDB_HOST = oldHost;
	}
});

test('all InfluxDB logging methods skip requests when the host is unset', () => {
	const originalLoad = Module._load;
	const oldHost = process.env.INFLUXDB_HOST;
	const oldTimeout = global.setTimeout;
	const oldWarn = console.warn;
	const modulePath = require.resolve('../src/utils/logger.js');
	let requests = 0;
	try {
		delete process.env.INFLUXDB_HOST;
		Module._load = function (request, ...args) {
			if (request === 'request') return () => requests++;
			if (request === 'node-dogstatsd') return { StatsD: class {} };
			if (request === 'statsd-client') return class {};
			if (request === './global.js') return { getShardString: () => '0' };
			if (request === '../data/config.json') return { debug: true };
			return originalLoad.call(this, request, ...args);
		};
		global.setTimeout = () => {};
		console.warn = () => {};
		const logger = require('../src/utils/logger.js');
		logger.command('test', { author: { id: '1' } });
		logger.logstash('test', { msg: {} });
		logger.logstashBanned('test', { msg: {} });
		logger.logstashCaptcha({});
		logger.logstashQos('test');
		assert.equal(requests, 0);
	} finally {
		delete require.cache[modulePath];
		Module._load = originalLoad;
		global.setTimeout = oldTimeout;
		console.warn = oldWarn;
		if (oldHost === undefined) delete process.env.INFLUXDB_HOST;
		else process.env.INFLUXDB_HOST = oldHost;
	}
});
