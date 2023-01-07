/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['removeoptout', 'roo'],

	owner: true,
	admin: true,
	manager: true,

	execute: async function (p) {
		if (!p.global.isUser('<@' + p.args[0] + '>')) {
			p.errorMsg(', Invalid user id', 3000);
			return;
		}

		const id = p.args[0];
		await p.redis.hdel('optOut', id);
		await p.pubsub.publish('optOut', { id, remove: true });
		await p.replyMsg(p.config.emoji.gear, `, removed user from opt out: ${id}`);
	},
});
