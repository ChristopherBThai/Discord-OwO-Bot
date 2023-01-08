/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const profileUtil = require('../social/util/profileUtil.js');

module.exports = new CommandInterface({
	alias: ['adminprofile'],

	owner: true,
	admin: true,
	manager: true,
	helper: true,

	execute: async function (p) {
		if (p.global.isUser(p.args[0]) || p.global.isInt(p.args[0])) {
			let user = p.args[0].match(/[0-9]+/)[0];
			user = await p.fetch.getUser(user);
			if (!user) {
				p.errorMsg(", I couldn't find that user!", 3000);
			} else {
				await profileUtil.displayProfile(p, user);
			}
		} else {
			p.errorMsg(', invalid arguments! Please tag a user');
		}
	},
});
