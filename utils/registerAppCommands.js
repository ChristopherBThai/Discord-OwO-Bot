/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

// Run this file to update all application commands
require('dotenv').config();
process.env['REGITER_COMMANDS'] = true;
const axios = require('axios');
const requireDir = require('require-dir');
const dir = requireDir('../src/commands/commandList', { recurse: true });
const CommandInterface = require('../src/commands/CommandInterface.js');

const url = `https://discord.com/api/v8/applications/${process.env.CLIENT_ID}/commands`;
const headers = {
	'Authorization': `Bot ${process.env.BOT_TOKEN}`,
};

const newCommands = {};
const currCommands = {};
const uniqueCommands = {};

async function run() {
	let result = await axios({
		method: 'GET',
		headers,
		url,
	});
	parseAppCommands(currCommands, result.data);

	for (let key in uniqueCommands) {
		if (isDiff(newCommands[key], currCommands[key])) {
			if (!newCommands[key]) {
				console.log(`Deleting command: ${key}`);
				await deleteCommand(currCommands[key].id);
			} else if (!currCommands[key]) {
				console.log(`Adding command: ${key}`);
				await addCommand(newCommands[key]);
			} else {
				console.log(`Editing command: ${key}`);
				await editCommand(newCommands[key], currCommands[key].id);
			}
		}
	}

	process.exit();
}

function init() {
	for (let key in dir) {
		if (dir[key] instanceof CommandInterface) {
			parseAppCommands(newCommands, dir[key].appCommands);
		} else if (Array.isArray(dir[key])) {
			dir[key].forEach((val) => {
				if (val instanceof CommandInterface) {
					parseAppCommands(newCommands, val.appCommands);
				}
			});
		} else {
			for (let key2 in dir[key]) {
				if (dir[key][key2] instanceof CommandInterface) {
					parseAppCommands(newCommands, dir[key][key2].appCommands);
				} else if (Array.isArray(dir[key][key2])) {
					dir[key][key2].forEach((val) => {
						if (val instanceof CommandInterface) {
							parseAppCommands(newCommands, val.appCommands);
						}
					});
				}
			}
		}
	}
}

function parseAppCommands(dict, commands) {
	commands?.forEach((appCommand) => {
		if (!appCommand.type) {
			// Default to slash command
			appCommand.type = 1;
		}
		const key = getKey(appCommand);
		if (dict[key]) {
			appendOptions(dict[key], appCommand);
		} else {
			dict[key] = appCommand;
			uniqueCommands[key] = true;
		}
	});
}

function appendOptions(baseCommand, newCommand) {
	const depth = getDepth(baseCommand, newCommand);
	let options = baseCommand.options;
	let append = newCommand.options;
	for (let i = 1; i < depth; i++) {
		options = options[0].options;
		append = append[0].options;
	}
	options.push(...append);
}

function getDepth(baseCommand, newCommand, depth = 0) {
	if (baseCommand.name === newCommand.name) {
		depth++;
		return getDepth(baseCommand.options[0], newCommand.options[0], depth);
	} else {
		return depth;
	}
}

function getKey(command) {
	return `${command.name}-${command.type}`;
}

function isDiff(newCommand, currCommand) {
	if (typeof newCommand !== typeof currCommand) {
		return true;
	} else if (typeof newCommand !== 'object') {
		if (newCommand !== currCommand) {
			return true;
		}
	} else if (Array.isArray(newCommand)) {
		if (!Array.isArray(currCommand) || newCommand.length !== currCommand.length) {
			return true;
		} else {
			for (let i = 0; i < newCommand.length; i++) {
				if (isDiff(newCommand[i], currCommand[i])) {
					return true;
				}
			}
		}
	} else {
		for (const key in newCommand) {
			if (isDiff(newCommand[key], currCommand[key])) {
				return true;
			}
		}
	}
	return false;
}

async function deleteCommand(commandId) {
	return axios({
		method: 'DELETE',
		headers,
		url: `${url}/${commandId}`,
	});
}

async function addCommand(command) {
	return axios({
		method: 'POST',
		headers,
		url,
		data: command,
	});
}

async function editCommand(command, commandId) {
	return axios({
		method: 'PATCH',
		headers,
		url: `${url}/${commandId}`,
		data: command,
	});
}

init();
run();
