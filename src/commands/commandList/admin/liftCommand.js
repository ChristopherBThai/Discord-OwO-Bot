/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const ban = require('../../../utils/ban.js');

module.exports = new CommandInterface({
	alias: ['liftcommand', 'lc'],

	owner: true,
	admin: true,

	execute: async function (p) {
		// Check if enough arguments
		if (p.args.length < 2) {
			p.errorMsg(', Invalid arguments!');
			return;
		}

		// Check if its an id
		let user = await p.fetch.getUser(p.args[0]);
		if (!user) {
			p.errorMsg(', Invalid user');
			return;
		}

		// Check if its a valid command
		let command;
		command = p.aliasToCommand[p.args[1]];
		if (!command) {
			p.errorMsg(', That is not a command!');
			return;
		}

		await ban.liftCommand(p, user, command);
	},
});
