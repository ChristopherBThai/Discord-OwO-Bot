/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const whitelist = ['409959187229966337','420104212895105044','552384921914572802']
const modChannel = ["471579186059018241","596220958730223619","645501936036216862","759637235237650440"];
const PrivateChannel = 1;
const levels = require('../utils/levels.js');
const blacklist = require('../utils/blacklist.js');

// Fired when a message is created
exports.handle = function(msg, raw){

	if (blacklist.checkBot(msg)) return;

	//Ignore if bot
	if(msg.author.bot) return;

	/* Ignore guilds if in debug mode */
	//else if(this.debug&&msg.channel.guild&&!whitelist.includes(msg.channel.guild.id)) return;

	else if(modChannel.includes(msg.channel.id)) this.command.executeMod(msg);

	else if(msg.author.id==this.auth.admin) this.command.executeAdmin(msg, raw);

	else if(msg.channel.type===PrivateChannel) this.macro.verify(msg,msg.content.trim());

	else 
		this.command.execute(msg, raw);

	levels.giveXP(msg);
}
