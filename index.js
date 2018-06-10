const debug = false;
if(debug) var auth = require('../tokens/scuttester-auth.json');
else var auth = require('../tokens/owo-auth.json');

const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./owo.js',{
		token:auth.token
});

var loaded = false;
const global = require('./parent_methods/global.js');

const vote = require('./parent_methods/vote.js');
const lottery = require('./parent_methods/lottery.js');

Manager.spawn();

Manager.on('launch', function(shard){
	console.log(`Launched shard ${shard.id}`);
	if(!loaded && shard.id == Manager.totalShards-1){
		loaded = true;
		setTimeout(updateActivity,15000);
	}
});

Manager.on('imessage', (shard, message) => {
	    console.log(`Shard[${shard.id}] : ${message._eval} : ${message._result}`);
});

function updateActivity(){
	console.log("Done loading all the shards");
	lottery.init();
	if(!debug)
		vote.setManager(Manager);
	global.setManager(Manager);
	Manager.broadcastEval("this.shard.fetchClientValues('guilds.size').then(results => {var result = results.reduce((prev, val) => prev + val, 0);this.user.setActivity('with '+result+' Servers!')}).catch(err => console.error(err))");
}

process.on('exit', function(code) {
	console.log("exiting...");
	Manager.broadcastEval("process.exit()");
});
