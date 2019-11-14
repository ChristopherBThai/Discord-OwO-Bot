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

	async execute(params){
		// Check if the bot has the correct perms first
		if(params.msg.channel.type===0&&this.permissions){
			let channel = params.msg.channel;
			let channelPerms = channel.permissionsOf(params.client.user.id);
			for(let i in this.permissions){
				if(!channelPerms.has(this.permissions[i])){
					if(channelPerms.has("sendMessages")&&channelPerms.has("readMessages"))
						params.errorMsg(", the bot does not have the `"+this.permissions[i]+"` permission! Please reinvite the bot, or contact your server admin!",4000);
					params.logger.increment("noperms",['permission:'+this.permissions[i],'channel:'+params.msg.channel.id,'guild:'+params.msg.channel.guild.id],'id:'+params.msg.author.id);
					return;
				}
			}
		}
		await this.executeCommand(params);
	}

}
