/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const enabledUtil = require('./utils/enabledUtil.js');
const settingEmoji = '⚙️';

module.exports = new CommandInterface({
	alias: ['enable'],

	args: '{command}',

	desc: 'Enable a command or a command group in the current channel',

	example: ['owo enable hunt', 'owo enable all'],

	related: ['owo disable'],

	permissions: ['sendMessages'],

	group: ['utility'],

	cooldown: 1000,
	half: 100,
	six: 500,

	execute: async function (p) {
		/* Checks if the user has permission */
		if (!p.msg.member.permissions.has('manageChannels')) {
			p.send('**🚫 | ' + p.msg.author.username + '**, You are not an admin!', 3000);
			return;
		}

		/* Parse commands */
		let commands = p.args.slice();
		for (let i = 0; i < commands.length; i++) commands[i] = commands[i].toLowerCase();

		/* If the user wants to enable all commands */
		if (commands.includes('all')) {
			let sql = 'DELETE FROM disabled WHERE channel = ' + p.msg.channel.id;
			await p.query(sql);
			p.replyMsg(settingEmoji, ', **All** commands have been **enabled** for this channel!');
			return;
		}

		// Parse which commands to enable
		let remove = new Set();
		for (let i = 0; i < commands.length; i++) {
			// Remove group
			if (p.commandGroups[commands[i]]) {
				let command = commands[i];
				remove.add(command);
				for (let i in p.commandGroups[command]) {
					remove.add(p.commandGroups[command][i]);
				}

				// Remove individual command
			} else {
				let command = p.aliasToCommand[commands[i]];
				if (command && command != 'disabled' && command != 'enable') {
					remove.add(command);
					let group = p.commands[command].group;
					for (let i in group) {
						remove.add(group[i]);
					}
				}
			}
		}
		if (remove.size) {
			await p.query(
				'DELETE FROM disabled WHERE channel = ' +
					p.msg.channel.id +
					" AND command IN ('all','" +
					Array.from(remove).join("','") +
					"');"
			);
		}

		p.send(await enabledUtil.createEmbed(p));
	},
});
