/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const commandGroups = require('../utils/commandGroups.js');

exports.handle = function (interaction) {
	switch (interaction.type) {
		case 2:
			handleCommand.bind(this)(interaction);
			break;
		default:
			break;
	}
};

function handleCommand(interaction) {
	switch (interaction.data.type) {
		case 1:
			handleSlash.bind(this)(interaction);
			break;
		case 2:
			handleUser.bind(this)(interaction);
			break;
		case 3:
			handleMessage.bind(this)(interaction);
			break;
		default:
			break;
	}
}

async function handleSlash(interaction) {
	ackTimer(interaction);
	interaction.command = getSlashCommand(interaction);
	interaction.author = interaction.member?.user || interaction.user;
	interaction.interaction = true;
	interaction.acked = false;
	interaction.options = getInteractionArgs(interaction.data, interaction.data.resolved);
	interaction.args = [];
	this.command.executeInteraction(interaction);
}

function getSlashCommand(interaction) {
	let command = commandGroups.interactionToCommand(interaction.data);
	return command || interaction.data.name;
}

async function handleMessage(interaction) {
	ackTimer(interaction);
	interaction.command = getApplicationCommand.bind(this)(interaction);
	interaction.author = interaction.member?.user || interaction.user;
	interaction.interaction = true;
	interaction.acked = false;
	interaction.options = getInteractionArgs(interaction.data, interaction.data.resolved);
	interaction.options.message = interaction.data.resolved?.messages?.entries().next().value[1];
	interaction.args = [];
	this.command.executeInteraction(interaction);
}

async function handleUser(interaction) {
	ackTimer(interaction);
	interaction.command = getApplicationCommand.bind(this)(interaction);
	interaction.author = interaction.member?.user || interaction.user;
	interaction.interaction = true;
	interaction.acked = false;
	interaction.options = getInteractionArgs(interaction.data, interaction.data.resolved);
	interaction.options.member = interaction.data.resolved?.members?.entries().next().value[1];
	interaction.options.user = interaction.data.resolved?.users?.entries().next().value[1];
	interaction.args = [];
	this.command.executeInteraction(interaction);
}

function getApplicationCommand(interaction) {
	let command = this.command.messageUserInteractionToCommand(interaction.data);
	return command || interaction.data.name;
}

function getInteractionArgs(interaction, resolved, result = {}) {
	interaction.options?.forEach((option) => {
		/* eslint-disable no-fallthrough */
		switch (option.type) {
			// User
			case 6:
				result[option.name] = resolved.users.get(option.value);
				break;
			case 8:
				result[option.name] = resolved.roles.get(option.value);
				break;
			// Sub command
			case 2:
			// Command
			case 1:
				getInteractionArgs(option, resolved, result);
				break;
			// Number
			case 4:
			// String
			case 3:
				result[option.name] = option.value;
				break;
		}
	});
	return result;
}

function ackTimer(interaction) {
	setTimeout(() => {
		if (interaction.ignoreDefer || interaction.acknowledged) return;
		interaction.defer().catch((_err) => {
			console.error('Interaction defer failed.');
		});
		interaction.acknowledged = true;
	}, 2500);
}
