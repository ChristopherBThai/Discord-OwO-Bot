/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const commandGroups = [
	{
		'name': 'gen',
		'type': 1,
		'description': 'Generate some images',
		'options': [],
		'integration_types': [0, 1],
		'contexts': [0, 1, 2],
	},
];

const commandMap = {};

exports.addOption = function (commandName, names, options) {
	const command = JSON.parse(JSON.stringify(findName(names[0], commandGroups)));
	let innerCommand = command;

	let innerMap = (commandMap[names[0]] = commandMap[names[0]] || {});

	for (let i = 1; i < names.length; i++) {
		innerCommand = findName(names[i], command.options);
		innerMap = innerMap[names[i]] = innerMap[names[i]] || {};
	}
	innerCommand.options.push(options);
	innerMap[options.name] = commandName;
	return command;
};

exports.interactionToCommand = function (interaction) {
	return interactionInMap(interaction, commandMap);
};

function interactionInMap(interaction, map) {
	if (typeof map === 'string') {
		return map;
	}
	const name = interaction.name;
	if (map[name]) {
		return interactionInMap(interaction.options[0], map[name]);
	} else {
		return false;
	}
}

function findName(name, list) {
	return list.find((ele) => ele.name === name);
}
