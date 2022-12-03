/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const CommandInterface = require('../../CommandInterface');
const macro = require('../../../../../tokens/macro');

module.exports = new CommandInterface({
	alias: ['banstatus'],
	owner: true,
	admin: true,
	manager: true,
	helper: true,

	execute: async function(p) {
		let userid = p.args[0];
		if (!p.global.isInt(userid)) {
			p.errorMsg(', Invalid user id!', 3000);
			return;
		}
		let user = await p.fetch.getUser(userid);
		let username = user ? user.username : userid;
		let info = await macro.fetchBanInfo(userid, username);
		p.send(info);
	}
});
