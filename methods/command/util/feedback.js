/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const global = require('../../../util/global.js');
const sender = require('../../../util/sender.js');
const ban = require('../../../util/ban.js');
const badwords = require('../../../../tokens/badwords.json');

const feedbackChannel = "519778148888346635";
const reportChannel = "596220958730223619";
const supportGuild = "420104212895105044";
const check = '✅';
const cross = '❎';

module.exports = new CommandInterface({

	alias:["feedback","question","report","suggest"],

	args:"{msg}",

	desc:"Send a message to an admin!",

	example:["owo feedback Thanks for the bot!"],

	related:[],

	permissions:["SEND_MESSAGES","EMBED_LINKS","ATTACH_FILES","ADD_REACTIONS"],

	cooldown:1,//300000,
	half:15,
	six:30,
	bot:true,

	execute: async function(p){
		var message = p.args.join(" ");
		if(!message||message === ''){
			p.send("**🚫 |** Silly **"+p.msg.author.username+"**, you need to add a message!",3000);
			p.setCooldown(5);
			return;
		}
		if(p.command!="suggest"&&message.length > 250){
			p.send("**🚫 |** Sorry, "+p.msg.author.username+"! Messages must be under 250 character!!!",3000);
			p.setCooldown(5);
			return;
		}else if(message.length > 1500){
			p.send("**🚫 |** Sorry, "+p.msg.author.username+"! Suggestions must be under 1500 character!!!",3000);
			p.setCooldown(5);
			return;
		}
		if(p.command == "suggest"){
			await suggest(p,message);
			return;
		}
		let sql = "INSERT INTO feedback (type,message,sender) values ('"+p.command+"',?,"+p.msg.author.id+");";
		sql = p.mysql.mysql.format(sql,message);
		p.con.query(sql,function(err,rows,field){
			if(err){console.error(err);return;}
			let avatar = "https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png";
			let embed = {
				"color": 10590193,
				"timestamp": new Date(),
				"thumbnail":{"url":avatar},
				"author": {
					"name": "OwO Bot Support",
					"icon_url":avatar
				},
				"fields": [
					{
						"name":"A user sent a feedback!",
						"value": "==============================================="
					},{
						"name": "Message ID",
						"value": rows.insertId,
						"inline": true
					},{
						"name": "Message Type",
						"value": p.command,
						"inline": true
					},{
						"name": "From "+p.msg.author.username+" ("+p.msg.author.id+")",
						"value": "```"+message+"```\n\n==============================================="
					}
				]
			};
			p.send("**📨 |** *OwO What's this?!*  "+p.msg.author.username+", Thanks for the "+p.command+"!");
			p.sender.msgChannel(reportChannel,{embed});
		});
	}

})

// Allow the user to confirm the suggestion before sending
async function suggest(p,message){
	let confirmation = {
		"color": p.config.embed_color,
		"author": {
			"name": p.msg.author.username+"'s suggestion",
			"icon_url":p.msg.author.avatarURL(),
		},
		"description":message,
		"fields":[
			{
				"name":"This suggestion will be sent to the OwO bot support server. Suggestions should not be abused. Do you confirm that this is appropriate and a valid suggestion?",
				"value":check+" to confirm. "+cross+" to decline"
			}
		]
	}
	let msg = await p.send({embed:confirmation});
	await msg.react(check);
	await msg.react(cross);
	let filter = (reaction, user) => [check,cross].includes(reaction.emoji.name) && user.id === p.msg.author.id;
	let collector = msg.createReactionCollector(filter,{time:60000});
	collector.on('collect',async r => {
			if(r.emoji.name===check) {
				confirmation.fields[0].value = check+" The suggestion has been posted! Thank you!\n"+p.config.emoji.blank+" Suggestions can be viewed at "+p.config.guildlink;
				collector.stop();
				await confirmSuggestion(p,message);
			}else if(r.emoji.name===cross){
				confirmation.fields[0].value = cross+" You decided not to post the suggestion!";
				collector.stop();
			}
	});

	collector.on('end',async function(collected){
		confirmation.color = 6381923;
		await msg.edit("This message is now inactive",{embed:confirmation});
	});

}

// Sends suggestion to support channel
async function confirmSuggestion(p,message){
	// Check for banned words
	let temp = message.replace(/\s/gi,"");
	for(let i in badwords){
		if(temp.indexOf(badwords[i])>=0){
			await ban.banCommand(p,p.msg.author,p.commandAlias,'Your suggestion did not seem appropriate');
			return;
		}
	}
	
	let embed = {
		"color": p.config.embed_color,
		"timestamp": new Date(),
		"author": {
			"name": p.msg.author.username+"'s suggestion",
			"icon_url":p.msg.author.avatarURL(),
		},
		"description":message,
		"footer": {
			"text": p.msg.author.id
		},
	};
	p.sender.msgChannel(feedbackChannel,{embed},{react:['👍','🔁','👎']});

}
