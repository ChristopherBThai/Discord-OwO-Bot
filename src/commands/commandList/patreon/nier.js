/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const emoji = "<:nier:955403965300871268>";
const owner = "282666590565171210";
const data = "nier";

module.exports = new CommandInterface({

	alias:["nier"],

	args:"{@user}",

	desc:"These collectables are only given out by ?" + owner + "?. This command was created by ?" + owner + "?",

	example:[],

	related:[],

	permissions:["sendMessages"],

	group:["patreon"],

	cooldown:15000,

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
			if (p.msg.author.id != owner) {
				p.errorMsg(", only the owner of this command can give items!",3000);
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

	p.replyMsg(emoji, ", you currently have "+count+" "+emoji+" **Plug-in chip**!");
}

async function give(p, user){
	await p.redis.hincrby("data_"+user.id, data, 1);
	p.send(`${emoji} **| ${user.username}**, you have been given 1 **Plug-in chip**.`);
}
