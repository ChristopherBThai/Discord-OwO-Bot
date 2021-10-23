/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const emotes = [
	"https://cdn.discordapp.com/attachments/581509910848864265/889613545023615016/psyduck-bonk.gif",
	"https://cdn.discordapp.com/attachments/581509910848864265/889613544553865236/bonk-anime.gif",
	"https://cdn.discordapp.com/attachments/581509910848864265/889613551843545118/sugiura-bonk.gif"
];
const bonkComments = [
	"Ouch!",
	"Gotta hurt!"
];
const noBonkComments = [
	"Woah!",
	"Better luck next time!"
];
const owner = "423166705477353472";

module.exports = new CommandInterface({

	alias:["bonk", "bomk"],

	args:["@user"],

	desc:"A custom command created by ?"+owner+"?! Bonk your friends!",

	example:["owo bonk @user"],

	related:["owo hug"],

	permissions:["sendMessages","embedLinks","attachFiles"],

	group:["actions"],

	cooldown:5000,
	half:100,
	six:500,

	execute: async function(p){
		if(p.args.length!=1||!p.global.isUser(p.args[0])){
			p.errorMsg(", Please @tag someone to use this command!",3000);
			return;
		}
		let target = p.getMention(p.args[0]);
		if(target == undefined){
			p.send("**🚫 |** I couldn't find that user :c",3000);
			return;
		}
		if(p.msg.author.id==target.id){
			let text = "**"+p.msg.author.username+"**, you can't bonk yourself!";
			p.send(text);
			return;
		}

		let emote = emotes[Math.trunc(Math.random()*emotes.length)];

		let text;
		if (target == owner) {
			if (Math.random() < 0.1) {
				let comment = bonkComments[Math.trunc(Math.random()*bonkComments.length)];
				text = `${target.username} got bonked by ${p.msg.author.username}! ${comment}`;
			} else {
				let comment = noBonkComments[Math.trunc(Math.random()*noBonkComments.length)];
				text = `${target.username} dodged ${p.msg.author.username}! ${comment}`;
				emote = "";
			}
		} else {
			if (Math.random() < 0.9) {
				let comment = bonkComments[Math.trunc(Math.random()*bonkComments.length)];
				text = `${target.username} got bonked by ${p.msg.author.username}! ${comment}`;
			} else {
				let comment = noBonkComments[Math.trunc(Math.random()*noBonkComments.length)];
				text = `${target.username} dodged ${p.msg.author.username}! ${comment}`;
				emote = "";
			}
		}

		let embed = {
			"color": 16776960,
			"image": {
				"url": emote
			},
			"author": {
				"name": text,
				"url": emote,
				"icon_url": p.msg.author.avatarURL
			}
		};
		p.send({embed});
		p.quest("emoteTo");
		p.quest("emoteBy",1,target);
	}

})
