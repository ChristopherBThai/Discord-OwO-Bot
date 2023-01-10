/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const checkEmoji = '✅';
const crossEmoji = '❎';
const emotes = require('../../../../data/emotes.json');
const censored = new Set();
for (let i in emotes.sEmote) {
	if (emotes.sEmote[i].mature) {
		censored.add(i);
	}
}
for (let i in emotes.uEmote) {
	if (emotes.uEmote[i].mature) {
		censored.add(i);
	}
}

exports.createEmbed = async function (p) {
	let sql = 'SELECT * FROM disabled WHERE channel = ' + p.msg.channel.id + ';';

	/* Query */
	let result = await p.query(sql);

	/* Construct message */
	let disabled = {};
	let all = false;

	for (let i = 0; i < result.length; i++) {
		let command = result[i].command;
		if (command == 'all') all = true;
		disabled[command] = true;
	}

	let embed = {
		author: {
			name: 'Enabled commands for #' + p.msg.channel.name,
		},
		color: p.config.embed_color,
		fields: [],
	};

	for (let group in p.commandGroups) {
		if (group != 'undefined') {
			let commands = [];
			let groupName;
			if (all || disabled[group]) {
				groupName = crossEmoji + ' **' + group + '**';
				for (let i in p.commandGroups[group]) {
					commands.push(addCommandText(p.commandGroups[group][i], true));
				}
			} else {
				groupName = checkEmoji + ' **' + group + '**';
				for (let i in p.commandGroups[group]) {
					let command = p.commandGroups[group][i];
					commands.push(addCommandText(command, disabled[command]));
				}
			}

			let wordCount = 0;
			let commandString = '';
			let fieldsCount = 0;
			commands.forEach((command) => {
				wordCount += command.length + 1;
				if (wordCount >= 1024) {
					embed.fields.push({
						name: groupName + ` [${fieldsCount + 1}]`,
						value: commandString,
					});
					wordCount = 0;
					commandString = '';
					fieldsCount++;
				}
				commandString += command + ' ';
			});
			if (commandString !== '') {
				embed.fields.push({
					name: groupName + (fieldsCount ? ` [${fieldsCount + 1}]` : ''),
					value: commandString,
				});
			}
		}
	}

	return { embed };
};

function addCommandText(command, disabled) {
	if (censored.has(command)) return '';
	if (disabled) return '~~*`' + command + '`*~~';
	else return '**' + command + '**';
}
