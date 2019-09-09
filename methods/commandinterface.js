/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

module.exports = class CommandInterface{

	constructor(args){
		this.alias = args.alias;
		this.desc = args.desc;
		this.args = args.args;
		this.example = args.example;
		this.related = args.related;
		this.executeCommand = args.execute;
		this.cooldown = args.cooldown;
		this.half = args.half;
		this.six = args.six;
		this.distinctAlias = args.distinctAlias;
		this.admin = args.admin;
		this.dm = args.dm;
		this.bot = args.bot;
		this.mod = args.mod;
		this.permissions = args.permissions;
	}

	execute(params){
		// Check if the bot has the correct perms first
		if(this.permissions){
			let me = params.msg.guild.me;
			let channelPerms = params.msg.channel.memberPermissions(me);
			for(let i in this.permissions){
				if(!channelPerms.has(this.permissions[i])){
					if(channelPerms.has("SEND_MESSAGES"))
						params.errorMsg(", the bot does not have the `"+this.permissions[i]+"` permission! Please reinvite the bot, or contact your server admin!",4000);
					return;
				}
			}
		}
		this.executeCommand(params);
	}

}
