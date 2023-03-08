/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['msgusers'],

	owner: true,
	admin: true,

	execute: async function () {
		const lines = this.args.join(' ').split(/\n+/gi);
		let users = {};
		let message = '';
		let collectingUsers = false;
		for (let i = 0; i < lines.length; i++) {
			if (collectingUsers || this.global.isUser('<@' + lines[i].trim() + '>')) {
				collectingUsers = true;
				users[lines[i].trim()] = true;
			} else {
				message += lines[i] + '\n';
			}
		}

		const usernames = [];
		for (let key in users) {
			try {
				const user = await this.sender.msgUser(key, message);
				if (!user) {
					this.errorMsg(', could not message: ' + key);
				} else {
					usernames.push('`' + user.username + '#' + user.discriminator + '`');
				}
			} catch (err) {
				console.error(err);
				this.errorMsg(', could not message: ' + key);
			}
		}

		this.send('Sent messages to: ' + usernames.join(','));
	},
});
