/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['grim'],

	args: [],

	desc: 'A custom command created by ?926910724939333632?!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['patreon'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function () {
		this.send({
			embed: {
				title: 'Grim has arrived on this aethereal plane',
				color: 1,
				image: {
					url: 'https://cdn.discordapp.com/attachments/937934871974785045/950063888311935097/598eba690e38bac2013b0de570574856_w200.gif',
				},
			},
		});
	},
});
