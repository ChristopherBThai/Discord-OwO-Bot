/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const enabledUtil = require('./utils/enabledUtil.js');

module.exports = new CommandInterface({
	alias: ['disable'],

	args: '{command1, command2, ...}',

	desc: 'Disable a command in the current channel. You can list multiple commands to disable multiple at once. You can also disable a whole group.',

	example: ['owo disable hunt battle zoo', 'owo disable gambling', 'owo disable all'],

	related: ['owo enable'],

	permissions: ['sendMessages'],

	group: ['utility'],

	cooldown: 1000,
	half: 100,
	six: 500,

	execute: async function (p) {
		/* Checks if the user has permission */
		if (!p.msg.member.permissions.has('manageChannels')) {
			p.errorMsg(', You are not an admin!', 3000);
			return;
		}

		/* Parse commands */
		let commands = p.args.slice();
		for (let i = 0; i < commands.length; i++) commands[i] = commands[i].toLowerCase();

		// If the user wants to disable all commands
		if (commands.includes('all')) {
			let list = '(' + p.msg.channel.id + ",'all'),";
			for (let key in p.mcommands) {
				if (key != 'disable' && key != 'enable')
					list += '(' + p.msg.channel.id + ",'" + key + "'),";
			}
			for (let key in p.commandGroups) {
				if (key != 'undefined') list += '(' + p.msg.channel.id + ",'" + key + "'),";
			}
			list = list.slice(0, -1);
			let sql = 'INSERT IGNORE INTO disabled (channel,command) VALUES ' + list + ';';
			await p.query(sql);
			p.send('**⚙ | All** commands have been **disabled** for this channel!');
			return;
		}

		// Disable commands from parsed args
		let sql = 'INSERT IGNORE INTO disabled (channel,command) VALUES ';
		let validCommand = false;
		for (let i = 0; i < commands.length; i++) {
			/* Convert command name to proper name */
			let command = p.aliasToCommand[commands[i]];
			if (!command && p.commandGroups[commands[i]]) command = commands[i];
			if (command && command != 'disabled' && command != 'enable' && command != 'undefined') {
				validCommand = true;
				sql += '(' + p.msg.channel.id + ",'" + command + "'),";
			}
		}
		sql = sql.slice(0, -1) + ';';
		if (validCommand) await p.query(sql);

		p.send(await enabledUtil.createEmbed(p));
	},
});
