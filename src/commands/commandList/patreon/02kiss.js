/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const emotes = ["https://i.imgur.com/XR3wNhP.gif"];

module.exports = new CommandInterface({

	alias:["02kiss"],

	args:["@user"],

	desc:"A custom command created by ?611567320552439808?!",

	example:[],

	related:[],

	permissions:["sendMessages","embedLinks","attachFiles"],

	group:["patreon"],

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
			let text = "**"+p.msg.author.username+"**! You can't kiss yourself!";
			p.send(text);
			return;
		}

		let emote = emotes[Math.trunc(Math.random()*emotes.length)];
		let embed = {
			"color": 6315775,
			"image": {
				"url": emote
			},
			"author": {
				"name" : p.msg.author.username+" kisses "+target.username+"!",
				"url":emote,
				"icon_url": p.msg.author.avatarURL
			}
		};
		p.send({embed});
		p.quest("emoteTo");
		p.quest("emoteBy",1,target);
	}

})
