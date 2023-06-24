/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['echo'],

	owner: true,
	admin: true,
	manager: true,

	execute: async function () {
		let channelId = this.args[0];
		let message = this.args.splice(1).join(' ').trim();

		if (!channelId) {
			return this.errorMsg(', please include a channel id', 3000);
		}

		if (!message) {
			return this.errorMsg(', please include a message', 3000);
		}

		let embed;
		try {
			embed = JSON.parse(message);
		} catch (error) {
			/* no-op */
		}

		if (!embed) {
			await this.client.createMessage(channelId, message);
		} else {
			try {
				await this.client.createMessage(channelId, { embed });
			} catch (error) {
				await this.errorMsg(
					', please provide data in atleast one of the embed following embed fields! `Description` `Thumbnail Url` `Title` `Author Name`'
				);
				return;
			}
		}

		this.replyMsg(
			this.config.emoji.gear,
			`${this.getName()}, I have sent the message to \`${channelId}\``
		);
	},
});
