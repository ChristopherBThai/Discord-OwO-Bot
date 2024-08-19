/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
require('dotenv').config();
if (!process.env.BOT_TOKEN) {
	console.error('Bot token not found in ~/.env file. Checking secret file instead...');
	require('dotenv').config({ path: './secret/env' });
	if (!process.env.BOT_TOKEN) {
		console.error('No bot token found. Please edit ./secret/env file and add your token');
		return;
	}
}

// Config file
const config = require('./src/data/config.json');

// Grab tokens and secret files
const debug = config.debug;
if (!debug) require('dd-trace').init();

const rateLimitUtil = require('./utils/rateLimitUtil.js');
const request = require('./utils/request.js');
// Eris-Sharder
const Sharder = require('eris-sharder').Master;
var result, shards, firstShardID, lastShardID;
const cluster = require('cluster');

let clusters = 60;

(async () => {
	try {
		//determine how many shards we will need for this manager
		if (!debug && cluster.isMaster) {
			result = await request.fetchInit();
			console.log(result);
			shards = parseInt(result['shards']);
			firstShardID = parseInt(result['firstShardID']);
			lastShardID = parseInt(result['lastShardID']);
		}
		if (debug) {
			shards = 3;
			firstShardID = 0;
			lastShardID = 2;
			clusters = 2;
		}

		console.log(
			'Creating shards ' + firstShardID + '~' + lastShardID + ' out of ' + shards + ' total shards!'
		);

		// Start sharder
		const sharder = new Sharder('Bot ' + process.env.BOT_TOKEN, config.sharder.path, {
			name: config.sharder.name,
			clientOptions: config.eris.clientOptions,
			debug: true,
			shards,
			clusters,
			firstShardID,
			lastShardID,
		});

		if (cluster.isMaster) {
			rateLimitUtil.init(sharder.bucket, debug);
		}
	} catch (e) {
		console.error('Failed to start eris sharder');
		console.error(e);
	}
})();
