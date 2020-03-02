/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const dateUtil = require('../../../utils/dateUtil.js');
const gif1 = "https://cdn.discordapp.com/attachments/626155987904102402/673253558577004555/image0.gif";
const gif2 = "https://cdn.discordapp.com/attachments/626155987904102402/673253769907142679/image0.gif";
const table = "alastor";

module.exports = new CommandInterface({

	alias:["alastor"],

	args:"[feed]",

	desc:"Feed Alastor! This command was created by ALradio",

	example:[],

	related:[],

	permissions:["sendMessages","embedLinks"],

	cooldown:10000,
	half:80,
	six:400,

	execute: async function(p){
		const lasttime = await p.redis.hget("cd_"+p.msg.author.id,table);
		const afterMid = dateUtil.afterMidnight(lasttime);

		let streak = 1;
		let title = p.msg.author.username+"'s Alastor";
		if (afterMid.after) {
			await p.redis.hset("cd_"+p.msg.author.id,table,afterMid.now);
			if (afterMid.withinDay || !lasttime) {
				streak = await p.redis.hincrby(p.msg.author.id,table);
				title = p.msg.author.username+" fed Alastor!";
			} else {
				await p.redis.hset(p.msg.author.id,table,1);
				title = p.msg.author.username+", Alastor has stopped broadcasting";
			}
		} else {
			streak = await p.redis.hget(p.msg.author.id,table);
		}

		const embed = {
			"author": {
				"name": title,
				"icon_url": p.msg.author.avatarURL
			},
			"color":p.config.embed_color,
			"image": {
				"url": afterMid.after ? gif1 : gif2
			},
			"footer": {
				"text": `STREAK: ${streak} | Resets in: ${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`
			}
		}

		p.send({embed});
	}

})
