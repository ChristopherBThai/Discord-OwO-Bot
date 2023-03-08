/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

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
		default:
			break;
	}
}

async function handleSlash(interaction) {
	ackTimer(interaction);
	interaction.command = interaction.data.name;
	interaction.author = interaction.member.user || interaction.user;
	interaction.interaction = true;
	interaction.acked = false;
	interaction.options = getInteractionArgs(interaction);
	interaction.args = [];
	this.command.executeInteraction(interaction);
}

function getInteractionArgs(interaction) {
	// console.log(interaction.data.options);
	const result = {};
	interaction.data.options?.forEach((option) => {
		switch (option.type) {
			// User
			case 6:
				result[option.name] = interaction.data.resolved.members.get(option.value);
				break;
			// Sub command
			case 2:
				// console.log(option);
				break;
			// Number
			case 4:
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
