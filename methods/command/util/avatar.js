/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

module.exports = new CommandInterface({

	alias:["avatar","user"],

	args:"{@user}",

	desc:"Look at your or other people's avatar!",

	example:["owo avatar @OwO"],

	related:[],

	cooldown:2000,
	half:100,
	six:500,

	execute: async function(p){
		let user = undefined;
		if(p.args.length==0){
			user = p.msg.member;
		}else if(p.global.isUser(p.args[0])||p.global.isInt(p.args[0])){
			let id = p.args[0].match(/[0-9]+/)[0];
			user = await p.msg.guild.fetchMember(id);
		}else{
			p.errorMsg(", that user is not in this guild!",3000);
		}

		const embed = {
			"fields": [{
					"name":user.user.tag+((user.user.bot)?" <:bot:489278383646048286>":"")+"  `"+user.presence.status+"`",
					"value":((user.nickname)?"`Nickname: "+user.nickname+"`\n":"")+"`ID: "+user.user.id+"`"+((user.colorRole)?"\n`RoleColor: "+user.displayHexColor+"`":"")
			}],
			"color": 4886754,
			"image":{"url":user.user.avatarURL},
		}
		p.send({embed});
	}

})
