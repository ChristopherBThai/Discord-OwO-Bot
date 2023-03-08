/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const banEmoji = '<:ban:444365501708107786>';

module.exports = new CommandInterface({
	alias: ['ban'],

	owner: true,
	admin: true,

	execute: async function (p) {
		let users = [],
			reason = [];
		let checkUser = true;
		for (let i in p.args) {
			const arg = p.args[i];
			if (checkUser && p.global.isInt(arg)) {
				users.push(arg);
			} else {
				checkUser = false;
				reason.push(arg);
			}
		}
		const time = parseInt(users.pop());

		if (!time || time > 1000000) {
			p.errorMsg(', ban time must be under 1,000,000');
			return;
		}

		reason = reason.join(' ');
		if (reason && reason != '') {
			reason = '\n**<:blank:427371936482328596> | Reason:** ' + reason;
		}

		const sqlUsers = [];
		users.forEach((user) => {
			sqlUsers.push(`(${user}, NOW(), 1, ${time})`);
		});
		const sql = `INSERT INTO timeout (id,time,count,penalty) VALUES ${sqlUsers.join(
			','
		)} ON DUPLICATE KEY UPDATE time = NOW(), count=count+1, penalty = ${time};`;
		await p.query(sql);

		const success = [];
		const successGuild = [];
		const dmFailed = [];
		const failed = [];
		let userObj, guildObj;
		for (let user of users) {
			try {
				if (
					(userObj = await p.sender.msgUser(
						user,
						'**☠ |** You have been banned for ' + time + ' hours!' + reason
					))
				)
					if (userObj.dmError) {
						dmFailed.push(userObj);
					} else {
						success.push(userObj);
					}
				else if ((guildObj = await p.fetch.getGuild(user, false))) successGuild.push(guildObj);
				else failed.push(user);
			} catch (e) {
				failed.push(user);
			}
		}

		let text = `${banEmoji} **|** I have banned ${success.length} users:\n`;
		success.forEach((user) => {
			text += `[${user.id}] ${user.username}#${user.discriminator}\n`;
		});
		if (successGuild.length) {
			text += `\n${banEmoji} **|** I have banned ${successGuild.length} guilds:\n`;
			successGuild.forEach((guild) => {
				text += `[${guild.id}] ${guild.name}\n`;
			});
		}
		if (failed.length || dmFailed.length) {
			text += `\n${banEmoji} **|** I could not DM these users:\n`;
			text += failed.join('\n') + '\n';
			dmFailed.forEach((user) => {
				text += `[${user.id}] ${user.username}#${user.discriminator}\n`;
			});
		}
		if (reason) {
			text += reason;
		}
		p.send(text);
	},
});
