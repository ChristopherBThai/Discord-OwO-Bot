const Discord = require(`discord.js`);
const { Client, Collection, MessageEmbed,MessageAttachment } = require(`discord.js`);
const { readdirSync } = require(`fs`);
const { join } = require(`path`);
const db = require('quick.db');
const { TOKEN, PREFIX, AVATARURL, BOTNAME, } = require(`./config.json`);
const figlet = require("figlet");
const client = new Client({ disableMentions: `` , partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login("ODcyODY5OTcyMjA3MTA4MTI2.YQwJgg.O8mmZOUI0vtJf3bY6Sht7_DfM24");
client.commands = new Collection();
client.setMaxListeners(0);
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);

//this fires when the BOT STARTS DO NOT TOUCH

/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

// Config file
const config = require('./src/data/config.json');

// Grab tokens and secret files
const debug = config.debug;
if(!debug) var tracer = require('dd-trace').init();

if(debug) var auth = require('../tokens/scuttester-auth.json');
else var auth = require('../tokens/owo-auth.json');

const request = require('./utils/request.js');
// Eris-Sharder
const Sharder = require('eris-sharder').Master;
var result,shards,firstShardID,lastShardID;

// Helper files
if(require('cluster').isMaster){
	const global = require('./utils/global.js');
	const RamCheck = new (require('./utils/ramCheck.js'))(global);
}

const totalShards = 10;

(async () => {
	try{
		//determine how many shards we will need for this manager
		if (!debug&&require('cluster').isMaster){
			result = await request.fetchInit();
			console.log(result);
			shards = parseInt(result["shards"]);
			firstShardID = parseInt(result["firstShardID"]);
			lastShardID = parseInt(result["lastShardID"]);
		}
		// How many clusters we will have
		var clusters = Math.ceil(shards/totalShards);
		if(debug){
			shards = 2;
			firstShardID = 0;
			lastShardID = 1;
			clusters = 1
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
