/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['resetcowoncy'],

	owner: true,
	admin: true,

	execute: async function (p) {
		if (p.args.length <= 1) {
			p.errorMsg(', Please include a reset reason', 3000);
			return;
		}

		if (!p.global.isUser('<@' + p.args[0] + '>')) {
			p.errorMsg(', Invalid user id', 3000);
			return;
		}

		let sql = `SELECT money FROM cowoncy WHERE id = ${p.args[0]};
			   UPDATE cowoncy SET money = 0 WHERE id = ${p.args[0]};`;
		let result = await p.query(sql);
		let cowoncy = result[0][0] ? result[0][0].money : undefined;

		let warn = p.args.slice(1).join(' ');
		let user = await p.sender.msgUser(
			p.args[0],
			'**⚠ |** Your cowoncy has been reset due to: **' + warn + '**'
		);
		if (user && !user.dmError && cowoncy) {
			p.send(
				`📨 **|** Successfully reset cowoncy for **${user.username + '#' + user.discriminator}**\n${
					p.config.emoji.blank
				} **|** Previously had: ${cowoncy} cowoncy`
			);
		} else if (cowoncy) {
			p.send(
				`⚠ **|** Successfully reset cowoncy for **${user.username + '#' + user.discriminator}**\n${
					p.config.emoji.blank
				} **|** Previously had: ${cowoncy} cowoncy**\n${
					p.config.emoji.blank
				} **|** I couldn't DM them.`
			);
		} else {
			p.send('⚠ **|** Failed to reset cowoncy');
		}
	},
});
