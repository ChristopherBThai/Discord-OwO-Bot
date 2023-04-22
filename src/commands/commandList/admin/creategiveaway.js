/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['cg', 'creategiveaway'],

	owner: true,
	admin: true,
	manager: true,

	execute: async function () {
		await this.giveaway.createGiveaway(this.msg.channel.id);
	},
});
