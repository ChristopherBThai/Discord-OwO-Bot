/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['warn'],

	owner: true,
	admin: true,
	manager: true,

	execute: async function (p) {
		if (p.args.length <= 1) {
			p.errorMsg(', Please include a warn reason', 3000);
			return;
		}

		if (!p.global.isUser('<@' + p.args[0] + '>')) {
			p.errorMsg(', Invalid user id', 3000);
			return;
		}

		let warn = p.args.slice(1).join(' ');
		let user = await p.sender.msgUser(
			p.args[0],
			'**⚠ |** You received a warning from a moderator: **' + warn + '**'
		);

		if (user && !user.dmError) {
			p.send(`📨 **|** Sent a warning to **${user.username}#${user.discriminator}**`);
		} else {
			p.send('⚠ **|** Failed to send a warning for that user');
		}
	},
});
