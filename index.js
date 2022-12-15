/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
require('dotenv').config()

// Config file
const config = require('./src/data/config');

// Grab tokens and secret files
const debug = config.debug;
const request = require('./utils/request');
const { BOT_TOKEN } = process.env;

// Eris-Sharder
const Sharder = require('eris-sharder').Master;
let result, shards, firstShardID, lastShardID;

let clusters = 60;

(async () => {
	try {
		// Determine how many shards we will need for this manager
		if (!debug && require('cluster').isMaster) {
			result = await request.fetchInit();
			console.log(result);
			shards = parseInt(result['shards']);
			firstShardID = parseInt(result['firstShardID']);
			lastShardID = parseInt(result['lastShardID']);
		}
		if (debug) {
			shards = 2;
			firstShardID = 0;
			lastShardID = 1;
			clusters = 2;
		}
		console.log(`Creating shards ${firstShardID} ~ ${lastShardID} out of ${shards} total shards!`);

		// Start sharder
		const sharder = new Sharder(`Bot ${BOT_TOKEN}`, config.sharder.path, {
			name: config.sharder.name,
			clientOptions: config.eris.clientOptions,
			debug: true,
			shards,
			clusters,
			firstShardID,
			lastShardID
		});
	} catch(e) {
		console.error('Failed to start eris sharder');
		return console.error(e);
	}
})();
