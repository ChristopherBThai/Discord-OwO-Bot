/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

// 6 hours from now
const endTime = new Date(Date.now() + 21600000);
const text = [
	'Good luck!',
	'Go get em!',
	'Beep boop.',
	"Good luck... You'll need it :)",
	'I wish you luck!',
];

module.exports = new CommandInterface({
	alias: ['distorted', 'dt'],

	args: '',

	desc: 'Check to see if distorted animals are available',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['utility'],

	cooldown: 5000,

	execute: async function (p) {
		const now = new Date();
		if (now > endTime) {
			p.replyMsg(
				p.config.emoji.distorted,
				`, **Distorted animals** are currently not available.\n${p.config.emoji.blank} **|** They are only available when the bot is reset manually or breaks.`
			);
		} else {
			const timeDiff = endTime - now;
			let times = p.global.parseTime(timeDiff);
			const message = text[Math.floor(Math.random() * text.length)];
			p.replyMsg(
				p.config.emoji.distorted,
				`, **Distorted animals** are available for ${times.text}!\n${p.config.emoji.blank} **|** ${message}`
			);
		}
	},
});
