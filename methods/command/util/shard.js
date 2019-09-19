/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const ReactionOverride = require('../../../overrides/ReactionSocketOverride.js');
const perPage = 15;
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';

module.exports = new CommandInterface({

	alias:["shards","shard"],

	args:"",

	desc:"",

	example:[""],

	related:[""],

	permissions:["SEND_MESSAGES"],

	cooldown:15000,
	half:80,
	six:500,

	execute: async function(p){
		let shardInfo = await fetchInfo(p);
		let shards = [];
		// char size: 5 4 13 4 6 8 5
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
			shards.push(text);
		}

		let currentPage = Math.floor(p.client.shard.ids[0]/perPage);
		let page = getPage(p,currentPage,shards);
		let maxPage = Math.ceil(shards.length/perPage);

		let msg = await p.send(page);
		await msg.react(prevPageEmoji);
		await msg.react(nextPageEmoji);

		let filter = (reaction,user) => [nextPageEmoji,prevPageEmoji].includes(reaction.emoji.name)&&p.msg.author.id==user.id;
		let collector = await msg.createReactionCollector(filter,{time:900000,idle:120000});
		ReactionOverride.addEmitter(collector,msg);

		collector.on('collect', async function(r){
			if(r.emoji.name===nextPageEmoji) {
				if(currentPage+1<maxPage) currentPage++;
				else currentPage = 0;
				page = getPage(p,currentPage,shards);
				await msg.edit(page);
			}else if(r.emoji.name===prevPageEmoji){
				if(currentPage>0) currentPage--;
				else currentPage = maxPage-1;
				page = getPage(p,currentPage,shards);
				await msg.edit(page);
			}
		});
		collector.on('end',async function(collected){
			page.embed.color = 6381923;
			await msg.edit("This message is now inactive",page);
		});
	}

})

function getPage(p,currentPage,shards){
	let desc = `\`\`\`\n[ID]  ping uptime        guilds channels users\n`;
	for(let i = currentPage*perPage;i<perPage+(currentPage*perPage);i++){
		if(shards[i])
			desc += (i==p.client.shard.ids[0]?">":"")+""+shards[i]+""+(i==p.client.shard.ids[0]?"<":"")+"\n";
	}
	desc += "```";
	let embed = {
		"author":{
			"name":p.msg.author.username+", here are the bot's shards!",
			"icon_url":p.msg.author.avatarURL()
		},
		"description":desc,
		"color": p.config.embed_color,
		"footer":{
			"text":"Page "+(currentPage+1)+"/"+Math.ceil(shards.length/perPage)
		}
	};

	return {embed};
}

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
