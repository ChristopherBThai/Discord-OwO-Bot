/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const request = require('request');

let influxErrorShown = false;

exports.init = function (bucket, debug) {
	setInterval(() => {
		logBucket(bucket, debug);
	}, 10000);
};

async function logBucket(bucket, debug) {
	const { concurrent, queueCount, bucketCount, waiting } = bucket.getState();
	const body = {
		password: process.env.INFLUXDB_PASS,
		metric: 'ratelimit',
		server: process.env.SHARDER_SERVER,
		concurrent,
		queueCount,
		bucketCount,
		waiting,
	};

	if (debug) {
		body.debug = true;
	}

	request(
		{
			method: 'POST',
			uri: `${process.env.INFLUXDB_HOST}/qos`,
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
}
