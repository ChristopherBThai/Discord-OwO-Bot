/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const sharinganEmoji = "<a:sharingan:655676957517807626>";
const owner = "323347251705544704";

module.exports = new CommandInterface({

	alias:["sharingan"],

	args:"{@user}",

	desc:"Give a sharingan to someone! You can only gain one if you receive it! This command was created by Rikudou Sennin",

	example:[],

	related:[],

	permissions:["sendMessages"],

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
	let count = await p.redis.zscore("sharingan",p.msg.author.id);
	if(!count) count = 0;

	p.replyMsg(sharinganEmoji,", You currently have **"+count+"** Sharingan in your stash to give!");
}

async function give(p,user){
	if(p.msg.author.id!=owner){
		let result = await p.redis.incr("sharingan",p.msg.author.id,-1);

		// Error checking
		if(result==null||result<0){
			if(result<0) p.redis.incr("sharingan",p.msg.author.id,1);
			p.errorMsg(", you do not have any Sharingans! >:c",3000);
			p.setCooldown(5);
			return;
		}
	}

	await p.redis.incr("sharingan",user.id,2);
	p.send(`${sharinganEmoji} **| ${user.username}**, you have received two Sharingans ${sharinganEmoji} from ${p.msg.author.username}'s stash! Beware of Danzo and Obito!`);
}
