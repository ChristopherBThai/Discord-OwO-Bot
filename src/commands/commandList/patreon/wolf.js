/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const emoji = "🐺";
const owner = "384202884553768961";
const data = "wolf";
const data2 = "wolfpack";
const plural = "wolves";
const wolfPackEmoji = "<:wolfpack:878176466083397652>";

module.exports = new CommandInterface({

	alias:["wolf"],

	args:"{@user | gather}",

	desc:"Give a wolf to someone! You can only gain one if you receive it! This command was created by ?384202884553768961?",

	example:[],

	related:[],

	permissions:["sendMessages"],

	group:["patreon"],

	cooldown:30000,
	half:80,
	six:400,
	bot:true,

	execute: async function (p) {
		if (p.args.length == 0) {
			display(p);
			p.setCooldown(5);
		} else if (p.args[0] == "gather") {
			gather(p);
		} else {
			let user = p.getMention(p.args[0]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild,p.args[0]);
				if(!user){
					p.errorMsg(", Invalid syntax! Please tag a user!",3000);
					p.setCooldown(5);
					return;
				}
			}
			if (user.id==p.msg.author.id) {
				p.errorMsg(", You cannot give it yourself!!",3000);
				p.setCooldown(5);
				return;
			}
			give(p,user);
		}
	}
});

async function display (p) {
	let count = await p.redis.hget("data_"+p.msg.author.id, data) || 0;
	let count2 = await p.redis.hget("data_"+p.msg.author.id, data2) || 0;

	p.replyMsg(emoji, ", you currently have "+count+" "+plural+" and " + count2 + " wolf pack(s)!");
}

async function give (p, user) {
	if (p.msg.author.id != owner) {
		let result = await p.redis.hincrby("data_"+p.msg.author.id, data, -1);

		// Error checking
		if(result==null||result<0){
			if(result<0) p.redis.hincrby("data_"+p.msg.author.id, data, 1);
			p.errorMsg(", you do not have any "+plural+" to give! >:c",3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.hincrby("data_"+user.id, data, 2);
	p.send(`${emoji} **| ${user.username}**, **${p.msg.author.username}** gave you 2 wolves!`);
}

async function gather (p) {
	let result = await p.redis.hincrby("data_"+p.msg.author.id, data, -10);
	if (result == null || result < 0) {
		if (result < 0) p.redis.hincrby("data_"+p.msg.author.id, data, 10);
		p.errorMsg(", you do not have have enough wolves! >:c", 3000);
		p.setCooldown(5);
		return;
	}

	const result2 = await p.redis.hincrby("data_"+p.msg.author.id, data2, 1);
	p.send(wolfPackEmoji + " **|** 10 of your wolves have gathered into a pack. You have " + result2 + " wolfpacks.")
}
