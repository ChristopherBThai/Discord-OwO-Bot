/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['duwasvivu'],

	args: '',

	desc: 'This command was created by ?666840617380478977?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 10000,
	half: 80,
	six: 400,
	bot: false,

	execute: async function (p) {
		p.send("Hi i'm duwas");
	},
});
