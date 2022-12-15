/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const user_emote = require('../emotes/user_emote.js');
const petUtil = require('./util/petUtil.js');

module.exports = new CommandInterface({
	alias: ['pets', 'pet'],

	args: '',

	desc: 'Displays your current pets! Add them by using them in battles!',

	example: [],

	related: ['owo battle', 'owo zoo'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 5000,
	half: 200,
	six: 600,

	execute: async function (p) {
		/* Is this a pat action? */
		if (p.global.isUser(p.args[0])) {
			p.command = 'pat';
			user_emote.execute(p);
			return;
		}

		if (p.args.length != 0) {
			p.errorMsg(', Incorrect arguments');
			return;
		}

		let animals = await petUtil.getAnimals(p);

		let embed = petUtil.getDisplay(p, animals);

		await p.send(embed);
	},
});
