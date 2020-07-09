/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const emoji = "<a:lollipop:714220336010362921>";
const owner = "370709798020448257";
const data = "lollipop";
const plural = "lollipops";

module.exports = new CommandInterface({

	alias:["lollipop"],

	args:"{@user}",

	desc:"Give a lollipop to someone! You can only gain one if you receive it! This command was created by SleepyPanda",

	example:[],

	related:[],

	permissions:["sendMessages"],

	group:["patreon"],

	cooldown:30000,
	half:80,
	six:400,
	bot:true,

	execute: async function(p){
		if(p.args.length==0){
			display(p);
			p.setCooldown(5);
		}else{
			let user = p.getMention(p.args[0]);
			if(!user){
				user = await p.fetch.getMember(p.msg.channel.guild,p.args[0]);
				if(!user){
					p.errorMsg(", Invalid syntax! Please tag a user!",3000);
					p.setCooldown(5);
					return;
				}
			}
			if(user.id==p.msg.author.id){
				p.errorMsg(", You cannot give it yourself!!",3000);
				p.setCooldown(5);
				return;
			}
			give(p,user);
		}
	}
});

async function display(p){
	let count = await p.redis.hget("data_"+p.msg.author.id, data);
	if(!count) count = 0;

	p.replyMsg(emoji, ", you currently have "+count+" "+plural+"!");
}

async function give(p,user){
	if(p.msg.author.id!=owner){
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
	p.send(`${emoji} **| ${user.username}**, ${p.msg.author.username} gave you 2 ${plural}!`);
}
