/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const emoji = "<a:obw:828405334145761310>";
const owner = "443015921968349184";
const data = "obw";

module.exports = new CommandInterface({

	alias:["obw"],

	args:"{@user}",

	desc:"These collectables are only given out by ?443015921968349184?. This command was created by ?443015921968349184?\n\nhttps://owobot.fandom.com",

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
			if(user.id==p.msg.author.id){
				p.errorMsg(", You cannot give it yourself!!",3000);
				p.setCooldown(5);
				return;
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

	p.replyMsg(emoji, ", you currently have "+count+" "+emoji+"!");
}

async function give(p, user){
	await p.redis.hincrby("data_"+user.id, data, 1);
	p.send(`${emoji} **| ${user.username}**, The OwO Bot Wiki bestows its knowledge to you.`);
}
