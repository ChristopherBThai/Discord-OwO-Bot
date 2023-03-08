/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['resetowo'],

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

		let sql = `SELECT count FROM user WHERE id = ${p.args[0]};
			UPDATE user SET count = 0 WHERE id = ${p.args[0]};
			SELECT count FROM guild WHERE id = ${p.args[0]};
			UPDATE guild SET count = 0 WHERE id = ${p.args[0]};`;
		let result = await p.query(sql);

		let count;
		if (result[0].length) {
			count = result[0][0].count;
		} else if (result[2].length) {
			count = result[2][0].count;
			const guild = await p.fetch.getGuild(p.args[0]);
			const guildName = guild ? guild.name : p.args[0];
			return p.send(
				`📨 **|** Successfully reset owo count for **${guildName}**\n${p.config.emoji.blank} **|** Previously had: ${count} owos`
			);
		} else {
			return p.send(`⚠ **|** Failed to reset owo count for ${p.args[0]}`);
		}

		let warn = p.args.slice(1).join(' ');
		let user = await p.sender.msgUser(
			p.args[0],
			'**⚠ |** Your owo count has been reset due to: **' + warn + '**'
		);
		if (user && !user.dmError && count) {
			p.send(
				`📨 **|** Successfully reset owo count for **${
					user.username + '#' + user.discriminator
				}**\n${p.config.emoji.blank} **|** Previously had: ${count} owos`
			);
		} else if (count) {
			p.send(
				`⚠ **|** Successfully reset owo count for **${
					user.username + '#' + user.discriminator
				}**\n${p.config.emoji.blank} **|** Previously had: ${count} owos**\n${
					p.config.emoji.blank
				} **|** I couldn't DM them.`
			);
		} else {
			p.send(`⚠ **|** Failed to reset owo count for ${p.args[0]}`);
		}
	},
});
