/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const delay = 30000;

module.exports = new CommandInterface({

	alias:["resetbot","restartbot"],

	admin:true,
	dm:true,

	execute: function(p){
		p.msg.channel.send("Restarting all shards...").then(function(){
			for(var i=0;i<p.client.shard.count;i++){
				if(i!=p.client.shard.ids[0]){
					var func = resetShard(p,i);
					setTimeout(func,(i+1)*delay);
				}
			}
			setTimeout(function(){
				p.msg.channel.send("["+p.client.shard.ids[0]+"] Restarting last shard...").then(function(){
					console.log("["+p.client.shard.ids[0]+"] Shard is restarting!");
					process.exit(0);
				});
			},(p.client.shard.count+1)*delay);
		});
	}

})

function resetShard(p,id){
	let num = id;
	return function(){
		p.client.shard.broadcastEval(`
			if(this.shard.ids[0]==${num}){
				console.log("["+this.shard.ids[0]+"] Shard is restarting!");
				process.exit(0);
			}
		`);
	}
}
