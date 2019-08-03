/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["shards","shard"],

	args:"",

	desc:"",

	example:[""],

	related:[""],

	cooldown:15000,
	half:80,
	six:500,

	execute: async function(p){
		let shardInfo = await fetchInfo(p);
		let shards = {};
		// char size: 5 4 13 4 6 8 5
		let title = `[ID]  ping uptime        guilds channels users`;
		for(let i in shardInfo){
			let shard = shardInfo[i];
			let id = '['+shardInfo[i].id+']';
			id += ' '.repeat((5-id.length<0)?0:5-id.length);
			let ping = Math.round(shard.ping)+'';
			ping += ' '.repeat((4-ping.length<0)?0:4-ping.length);
			let uptime = toTime(shard.uptime);
			uptime += ' '.repeat((13-uptime.length<0)?0:13-uptime.length);
			let guilds = shard.guilds+'';
			guilds += ' '.repeat((6-guilds.length<0)?0:6-guilds.length);
			let channels = shard.channels+'';
			channels += ' '.repeat((8-channels.length<0)?0:8-channels.length);
			let users = shard.users+'';
			users += ' '.repeat((5-users.length<0)?0:5-users.length);

			let text = `${id} ${ping} ${uptime} ${guilds} ${channels} ${users}`;
			shards[parseInt(shardInfo[i].id)] = text;
		}

		let result = "```\n"+title;
		for(let i=0;i<shardInfo.length;i++){
			let text = shards[i];
			result += "\n"+(i==p.client.shard.ids[0]?'>':'')+text+(i==p.client.shard.id?'<':'');
		}
		result += "```";

		p.msg.channel.send(result,{split:{prepend:'```',append:'```'}})
			.catch(console.error);
	}

})

async function fetchInfo(p){
	return result = await p.client.shard.broadcastEval(`
		let startedAt = "OFFLINE";
		if(this.readyAt) startedAt = this.readyAt.toLocaleString();
		let result = {
			id:this.shard.ids[0],
			users:this.users.size,
			guilds:this.guilds.size,
			channels:this.channels.size,
			ping:this.ws.ping,
			uptime:this.uptime,
			startedAt
		}
		result;
	`);
}

function toTime(ms){
	let result = "";
	ms = Math.floor(ms/1000);
	var sec = ms%60;
	if(ms>=1) result = sec+"s";

	ms = Math.floor(ms/60);
	var min = ms%60;
	if(ms>=1) result = min+"m"+result;

	ms = Math.floor(ms/60);
	var hour = ms%24;
	if(ms>=1) result = hour+"h"+result;

	ms = Math.floor(ms/24);
	let day = ms;
	if(ms>=1) result = day+"d"+result;

	return result;
}
