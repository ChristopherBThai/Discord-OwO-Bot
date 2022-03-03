/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

exports.handle = function(interaction) {
	switch (interaction.type) {
		case 2:
			handleCommand.bind(this)(interaction)
			break;
		default:
			break;
	}
}

function handleCommand(interaction) {
	switch (interaction.data.type) {
		case 1:
			handleSlash.bind(this)(interaction);
			break;
		default:
			break;
	}
}

function handleSlash(interaction) {
	interaction.command = interaction.data.name;
	interaction.author = interaction.member.user || interaction.user
	interaction.interaction = true;
	// TODO
	interaction.args = [];
	this.command.executeInteraction(interaction);
}
