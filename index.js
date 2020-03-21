/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
// Grab tokens and secret files
const debug = false;
if(!debug) var tracer = require('dd-trace').init()
if(debug) var auth = require('../tokens/scuttester-auth.json');
else var auth = require('../tokens/owo-auth.json');

// Config file
const config = require('./src/data/config.json');
const request = require('./utils/request.js');
// Eris-Sharder
const Sharder = require('eris-sharder').Master;
var result,shards,firstShardID,lastShardID;

// Helper files
if(require('cluster').isMaster){
	const global = require('./utils/global.js');
	const RamCheck = new (require('./utils/ramCheck.js'))(global);
}

(async () => {
	try{
		//determine how many shards we will need for this manager
		if (!debug&&require('cluster').isMaster){
			result = await request.fetchInit();
			shards = result["shards"];
			firstShardID = result["firstShardID"];
			lastShardID = result["lastShardID"];
		}
		// How many clusters we will have
		var clusters = Math.ceil(shards/5);
		if(debug){
			shards = 4;
			firstShardID = 0;
			lastShardID = shards-1;
			clusters = 2
		}
		console.log("Creating shards "+firstShardID+"~"+lastShardID+" out of "+shards+" total shards!");

		// Start sharder
		const sharder = new Sharder("Bot "+auth.token, config.sharder.path, {
			name: config.sharder.name,
			clientOptions: config.eris.clientOptions,
			debug:true,
			shards,clusters,
			firstShardID,
			lastShardID,
		});

	}catch(e){
		console.error("Failed to start eris sharder");
		console.error(e);
	}
})();
