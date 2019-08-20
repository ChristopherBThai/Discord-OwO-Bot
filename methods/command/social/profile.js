/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../commandinterface.js');

const profileUtil = require('./util/profileUtil.js');
const imagegenAuth = require('../../../../tokens/imagegen.json');

module.exports = new CommandInterface({

	alias:["profile"],

	args:"set [about|background|wallpaper|title] {argument}",

	desc:"Display your profile!",

	example:["owo profile","owo profile set about Hello!"],

	related:[],

	cooldown:3000,
	half:100,
	six:500,

	execute: async function(p){
		if(p.args.length<=0){
			await profileUtil.displayProfile(p,p.msg.author);
		}else if(p.global.isUser(p.args[0])||p.global.isInt(p.args[0])){
			await profileUtil.displayProfile(p,p.msg.author);
			/*
			let user = p.args[0].match(/[0-9]+/)[0];
			user = await p.global.getUser(user);
			if(!user)
				p.errorMsg(", I couldn't find that user!",3000);
			else
				await displayProfile(p,user);
			*/
		}else if(p.args.length>1&&p.args[0]=='set'){
			if(['about'].includes(p.args[1].toLowerCase())){
				profileUtil.editAbout(p);
			}else if(['background','wallpaper','wp'].includes(p.args[1].toLowerCase())){
				profileUtil.editBackground(p);
			}else if(['title','status'].includes(p.args[1].toLowerCase())){
				profileUtil.editTitle(p);
			}else{
				p.errorMsg(", Invalid arguments! You can only edit `about` and `background`!",3000);
			}
		}
	}

})

