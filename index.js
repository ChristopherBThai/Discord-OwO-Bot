/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */
	
const debug = false;
if(!debug) var tracer = require('dd-trace').init()

/* Default is 4. Use higher numbers if you have enough cores */
process.env.UV_THREADPOOL_SIZE = 17;

if(debug) var auth = require('../tokens/scuttester-auth.json');
else var auth = require('../tokens/owo-auth.json');

const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./owo.js',{
		token:auth.token
});

var loaded = false;
const global = require('./parent_methods/global.js');
const ramCheck = require('./parent_methods/ramCheck.js');
const vote = require('./parent_methods/vote.js');
const lottery = require('./parent_methods/lottery.js');
const messageHandler = require('./parent_methods/messageHandler.js');
const levelCooldown = require('./parent_methods/levelCooldown.js');


Manager.on('shardCreate', function(shard){
	console.log(`Launched shard ${shard.id}`);
	if(!loaded && shard.id == Manager.totalShards-1){
		loaded = true;
		setTimeout(updateActivity,15000);
	}
	shard.on('message',(message) => {
		messageHandler.handle(Manager,shard,message);
	});
});

function updateActivity(){
	console.log("Done loading all the shards");
	if(!debug){
		lottery.init();
		vote.setManager(Manager);
	}
	global.setManager(Manager);
	Manager.broadcastEval("this.shard.fetchClientValues('guilds.size').then(results => {var result = results.reduce((prev, val) => prev + val, 0);this.user.setActivity('with '+result+' Servers!')}).catch(err => console.error(err))");
}

process.on('exit', function(code) {
	console.log("exiting...");
	Manager.broadcastEval("process.exit()");
});

try{
	console.log("Manager is going to spawn "+Manager.totalShards+" shards...");
	Manager.spawn(Manager.totalShards,5500,120000).catch(console.error);
}catch(err){
	console.log("Manager Spawner Error");
	console.error(err);
}

ramCheck.check(Manager);

process.on('unhandledRejection', (reason, promise) => {
	console.error("unhandledRejection at index.js error "+(new Date()).toLocaleString());
	console.error(reason);
});

process.on('uncaughtException', (err) => {
	console.error("uncaughtException at index.js error "+(new Date()).toLocaleString());
	console.error(err);
});
