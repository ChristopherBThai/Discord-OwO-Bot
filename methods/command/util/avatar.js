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

	permissions:["SEND_MESSAGES","EMBED_LINKS","ATTACH_FILES"],

	cooldown:2000,
	half:100,
	six:500,

	execute: async function(p){
		try{
			let user = undefined;
			if(p.args.length==0){
				user = p.msg.author;
			}else if(p.global.isUser(p.args[0])||p.global.isInt(p.args[0])){
				let id = p.args[0].match(/[0-9]+/)[0];
				user = await p.global.getUser(id);
			}

			if(!user){
			p.errorMsg(", I failed to fetch user information... sowwy",3000);
				return;
			}

			let embed = {
				"fields": [{
						"name":user.tag+((user.bot)?" <:bot:489278383646048286>":"")+"  `"+user.presence.status+"`",
						"value":"`ID: "+user.id+"`"
				}],
				"color": 4886754,
				"image":{"url":user.avatarURL({size:1024})},
			}

			if(member = await p.global.getMember(p.msg.guild,user)){
				embed.fields[0].value = ((member.nickname)?"`Nickname: "+member.nickname+"`\n":"")+"`ID: "+member.user.id+"`"+((member.roles.color)?"\n`RoleColor: "+member.displayHexColor+"`":"")
			}

			await p.send({embed});
		}catch(e){
			p.errorMsg(", I failed to fetch user information... sowwy",3000);
		}
	}

})
