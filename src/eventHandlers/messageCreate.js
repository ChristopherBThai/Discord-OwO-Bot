/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const whitelist = ['409959187229966337', '420104212895105044', '552384921914572802'];
const levels = require('../utils/levels.js');
/* eslint-disable-next-line */
const blacklist = require('../utils/blacklist.js');
const survey = require('../utils/survey.js');

// Fired when a message is created
exports.handle = async function (msg, raw) {
	// if (blacklist.checkBot(msg)) return;
	if (this.optOut[msg.author.id]) return;

	//Ignore if bot
	if (msg.author.bot) {
		return;
	} else if (
		/* Ignore guilds if in debug mode */
		this.debug &&
		msg.channel.guild &&
		!whitelist.includes(msg.channel.guild.id)
	) {
		return;
	} else if (await this.command.executeAdmin(msg, raw)) {
		return;

		// no guild, its a dm
	} else if (!msg.channel.guild) {
		if (await this.macro.verify(msg, msg.content.trim())) {
			survey.handle.bind(this)(msg);
		}
	} else {
		this.command.execute(msg, raw);
		levels.giveXP(msg);
	}
};
