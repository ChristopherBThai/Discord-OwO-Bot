/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['banguildmembers'],

	owner: true,
	admin: true,

	execute: async function () {
		const guildId = this.args[0];
		if (!this.global.isInt(guildId)) {
			return this.errorMsg(', invalid guild id!');
		}

		let guild;
		try {
			guild = await this.fetch.getGuild(guildId, false);
			if (!guild) {
				return this.errorMsg(', invalid guild id!');
			}
		} catch (err) {
			return this.errorMsg(', invalid guild id!');
		}

		this.send(`Attempting to ban all guild members in ${guild.name}...`);
		this.pubsub.publish('banGuildMembers', {
			guildId,
			replyChannel: this.msg.channel.id,
		});
	},
});
