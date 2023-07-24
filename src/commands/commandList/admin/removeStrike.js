/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['removestrike', 'setstrike'],

	owner: true,
	admin: true,
	manager: true,
	helper: true,

	execute: async function () {
		let user = this.args[0]?.match(/[0-9]+/)[0];
		user = await this.fetch.getUser(user);
		if (!user) {
			return this.errorMsg(", I couldn't find that user!", 3000);
		}

		let strikes;
		if (this.command === 'removestrike') {
			strikes = await this.macro.removeStrike(user.id);
		} else {
			if (!this.global.isInt(this.args[1])) {
				return this.errorMsg(', invalid strike count!', 3000);
			}
			strikes = parseInt(this.args[1]);
			strikes = await this.macro.setStrike(user.id, strikes);
		}

		this.replyMsg(
			this.config.emoji.gear,
			`, I set ${this.getUniqueName(user)}'s strike to \`${strikes}\``
		);
	},
});
